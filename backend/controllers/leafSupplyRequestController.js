const mongoose = require('mongoose');
const LeafSupplyRequest = require('../models/LeafSupplyRequest');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const TeaLeafEntry = require('../models/TeaLeafEntry');
const TeaRate = require('../models/TeaRate');
const { sendEmail } = require('../utils/mailer');

function toObjectIdOrNull(value) {
    try {
        if (!value) return null;
        return new mongoose.Types.ObjectId(String(value));
    } catch {
        return null;
    }
}

async function resolveSupplierFromAuth(req) {
    const authUserId = req.user?.userId || req.user?.id;
    if (!authUserId) return null;

    let supplier = await Supplier.findOne({ userId: authUserId, status: { $ne: 'Inactive' } });
    if (supplier) return supplier;

    const user = await User.findById(authUserId).select('email');
    const email = (user?.email || '').toLowerCase().trim();
    if (!email) return null;

    supplier = await Supplier.findOne({ email, status: { $ne: 'Inactive' } });
    if (supplier && !supplier.userId) {
        supplier.userId = authUserId;
        await supplier.save();
    }

    return supplier;
}

function formatKg(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return `${n.toLocaleString()} kg`;
}

function buildRequestEmailHtml({ supplierName, requestedKg, requestedForAt, pickupLocation, notes }) {
    const when = requestedForAt ? new Date(requestedForAt).toLocaleString() : 'Not specified';
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #111;">
        <h2 style="margin: 0 0 8px;">New Tea Leaf Supply Request</h2>
        <p style="margin: 0 0 16px;">Dear ${supplierName || 'Supplier'},</p>
        <p style="margin: 0 0 16px;">An Inventory Manager has requested tea leaf supply. Please log in to your Supplier Dashboard to confirm or reject this request.</p>
        <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px; border: 1px solid #e5e7eb;">
          <tr>
            <td style="border: 1px solid #e5e7eb; background:#f9fafb; width: 180px;"><b>Requested Quantity</b></td>
            <td style="border: 1px solid #e5e7eb;">${formatKg(requestedKg)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; background:#f9fafb;"><b>Requested For</b></td>
            <td style="border: 1px solid #e5e7eb;">${when}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; background:#f9fafb;"><b>Pickup Location</b></td>
            <td style="border: 1px solid #e5e7eb;">${pickupLocation ? String(pickupLocation) : 'Not specified'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e5e7eb; background:#f9fafb;"><b>Notes</b></td>
            <td style="border: 1px solid #e5e7eb;">${notes ? String(notes).replace(/</g, '&lt;') : '-'}</td>
          </tr>
        </table>
        <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px;">This email was sent automatically by GreenLeaf Tea Factory System.</p>
      </div>
    `;
}

async function createTeaLeafEntryFromReceipt({ supplierDoc, receivedKg, recordedByUserId, receivedAt, manualDeductions = {} }) {
    const weight = Number(receivedKg);
    if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error('Invalid receivedKg');
    }

    let teaRate = null;
    if (supplierDoc.factoryId) {
        teaRate = await TeaRate.findOne({ factoryId: supplierDoc.factoryId, status: 'Active' }).sort({ effectiveDate: -1 });
    }
    if (!teaRate) {
        teaRate = await TeaRate.findOne({ status: 'Active' }).sort({ effectiveDate: -1 });
    }
    if (!teaRate) {
        throw new Error('No active tea rate found');
    }

    // Use manual values if provided, else fall back to percentages from teaRate
    const bagWeight = typeof manualDeductions.bagWeight === 'number' 
        ? manualDeductions.bagWeight 
        : (weight * (teaRate.bagWeightPercentage || 0)) / 100;

    const waterWeight = typeof manualDeductions.waterWeight === 'number' 
        ? manualDeductions.waterWeight 
        : (weight * (teaRate.waterWeightPercentage || 0)) / 100;

    const coarseLeafWeight = typeof manualDeductions.coarseLeafWeight === 'number' 
        ? manualDeductions.coarseLeafWeight 
        : (weight * (teaRate.coarseLeafPercentage || 0)) / 100;

    const netWeight = weight - bagWeight - waterWeight - coarseLeafWeight;
    const ratePerKg = teaRate.defaultRate;
    const netAmount = netWeight * ratePerKg;

    const entryData = {
        supplierId: supplierDoc._id,
        factoryId: supplierDoc.factoryId || undefined,
        date: receivedAt || new Date(),
        weight,
        ratePerKg,
        grossAmount: weight * ratePerKg,
        bagWeight,
        waterWeight,
        coarseLeafWeight,
        netWeight,
        netAmount,
        recordedBy: recordedByUserId,
        status: 'Recorded',
        notes: manualDeductions.notes || 'Recorded from leaf supply request receipt',
    };
    // Only include routeId if the supplier actually has one
    if (supplierDoc.routeId) {
        entryData.routeId = supplierDoc.routeId;
    } else {
        // Explicitly set to null to avoid any 'required' confusion
        entryData.routeId = null;
    }

    const entry = await TeaLeafEntry.create(entryData);

    await Supplier.findByIdAndUpdate(supplierDoc._id, {
        $inc: { totalSupplied: netWeight, totalEarnings: netAmount }
    });

    return { entry, netWeight, netAmount, ratePerKg };
}


// ── Email Templates ──────────────────────────────────────────────────────────

function buildConfirmationEmailHtml({ managerName, supplierName, requestedKg, requestedForAt, pickupLocation, confirmedAt }) {
    const when = requestedForAt ? new Date(requestedForAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : 'Not specified';
    const confirmedOn = confirmedAt ? new Date(confirmedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : new Date().toLocaleString();
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,37,31,0.10)">
  <tr><td style="background:linear-gradient(135deg,#01251F 0%,#165E52 100%);padding:40px 40px 32px;text-align:center">
    <div style="width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px">✅</div>
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px">Supply Request Confirmed</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:15px">GreenLeaf Tea Factory — Leaf Supply System</p>
  </td></tr>
  <tr><td style="padding:36px 40px">
    <p style="margin:0 0 8px;color:#374151;font-size:16px">Dear <strong style="color:#01251F">${managerName || 'Inventory Manager'}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">Great news! <strong>${supplierName || 'The supplier'}</strong> has confirmed your tea leaf supply request. Please prepare for the incoming delivery.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border:1px solid #d1fae5;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr><td style="color:#6b7280;font-size:13px;width:160px">📦 Requested Qty</td><td style="color:#01251F;font-size:15px;font-weight:700">${formatKg(requestedKg)}</td></tr>
          <tr style="background:rgba(1,37,31,0.03)"><td style="color:#6b7280;font-size:13px">📅 Delivery Date</td><td style="color:#01251F;font-size:14px">${when}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px">📍 Pickup Location</td><td style="color:#01251F;font-size:14px">${pickupLocation || 'Not specified'}</td></tr>
          <tr style="background:rgba(1,37,31,0.03)"><td style="color:#6b7280;font-size:13px">✅ Confirmed On</td><td style="color:#01251F;font-size:14px">${confirmedOn}</td></tr>
        </table>
      </td></tr>
    </table>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px">
      <p style="margin:0;color:#92400e;font-size:13px">⚠️ <strong>Action Required:</strong> Once you receive the delivery, mark it as <em>Received</em> in the system to update inventory records.</p>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center">
    <p style="margin:0;color:#9ca3af;font-size:12px">This is an automated message from GreenLeaf Tea Factory Management System. Please do not reply.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildReceivedEmailHtml({ supplierName, receivedKg, netWeight, netAmount, ratePerKg, receivedAt }) {
    const receivedOn = receivedAt ? new Date(receivedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : new Date().toLocaleString();
    const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,37,31,0.10)">
  <tr><td style="background:linear-gradient(135deg,#01251F 0%,#165E52 100%);padding:40px 40px 32px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🍃</div>
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700">Supply Received — Thank You!</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:15px">GreenLeaf Tea Factory — Leaf Supply System</p>
  </td></tr>
  <tr><td style="padding:36px 40px">
    <p style="margin:0 0 8px;color:#374151;font-size:16px">Dear <strong style="color:#01251F">${supplierName || 'Valued Supplier'}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">We are pleased to confirm that your tea leaf supply has been <strong>received and recorded</strong> in our system. Thank you for your continued partnership with GreenLeaf Tea Factory.</p>
    <div style="background:linear-gradient(135deg,#e1f4ef,#f0fdf4);border:1px solid #a7f3d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px">Net Weight Received</p>
      <p style="margin:0;color:#01251F;font-size:42px;font-weight:800">${fmt(netWeight)} <span style="font-size:20px">kg</span></p>
    </div>
    <table width="100%" cellpadding="8" cellspacing="0" style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:24px">
      <tr style="background:#f3f4f6"><td colspan="2" style="padding:10px 16px;color:#374151;font-weight:600;font-size:13px;border-radius:8px 8px 0 0">📋 Receipt Summary</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px">Gross Weight</td><td style="color:#111827;font-size:14px;font-weight:600;text-align:right">${fmt(receivedKg)} kg</td></tr>
      <tr style="background:#f9fafb"><td style="padding:10px 16px;color:#6b7280;font-size:13px">Net Weight (after deductions)</td><td style="color:#111827;font-size:14px;font-weight:600;text-align:right">${fmt(netWeight)} kg</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px">Rate per kg</td><td style="color:#111827;font-size:14px;font-weight:600;text-align:right">Rs. ${fmt(ratePerKg)}</td></tr>
      <tr style="background:#ecfdf5"><td style="padding:12px 16px;color:#065f46;font-size:14px;font-weight:700">💰 Estimated Earnings</td><td style="color:#065f46;font-size:16px;font-weight:800;text-align:right">Rs. ${fmt(netAmount)}</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px">Received On</td><td style="color:#111827;font-size:13px;text-align:right">${receivedOn}</td></tr>
    </table>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">Your earnings will be processed at the end of the current payment cycle and disbursed according to your preferred payment method. For any queries, please contact the factory office.</p>
  </td></tr>
  <tr><td style="background:#01251F;padding:24px 40px;text-align:center">
    <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px">Thank you for growing with us 🌱</p>
    <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px">GreenLeaf Tea Factory Management System — Automated Notification</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildThankYouForConfirmingEmailHtml({ supplierName, requestedKg, requestedForAt, pickupLocation }) {
    const when = requestedForAt ? new Date(requestedForAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : 'Not specified';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,37,31,0.10)">
  <tr><td style="background:linear-gradient(135deg,#01251F 0%,#165E52 100%);padding:40px 40px 32px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🙏</div>
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700">Thank You for Confirming!</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:15px">GreenLeaf Tea Factory — Leaf Supply System</p>
  </td></tr>
  <tr><td style="padding:36px 40px">
    <p style="margin:0 0 8px;color:#374151;font-size:16px">Dear <strong style="color:#01251F">${supplierName || 'Valued Supplier'}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">Thank you for confirming the tea leaf supply request. We have notified our inventory team, and they are preparing for the delivery.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr><td style="color:#6b7280;font-size:13px;width:160px">📦 Supply Quantity</td><td style="color:#01251F;font-size:15px;font-weight:700">${formatKg(requestedKg)}</td></tr>
          <tr style="background:rgba(1,37,31,0.03)"><td style="color:#6b7280;font-size:13px">📅 Delivery Schedule</td><td style="color:#01251F;font-size:14px">${when}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px">📍 Pickup Point</td><td style="color:#01251F;font-size:14px">${pickupLocation || 'Factory Premises'}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6">Once the delivery is received at the factory, you will receive another notification with the recorded weight and earnings details.</p>
  </td></tr>
  <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center">
    <p style="margin:0;color:#9ca3af;font-size:12px">GreenLeaf Tea Factory Management System — Automated Notification</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

exports.createRequest = async (req, res) => {
    try {
        const createdBy = req.user?.userId;
        const { supplierId, requestedKg, requestedForAt, pickupLocation, notes } = req.body || {};

        const supplierObjectId = toObjectIdOrNull(supplierId);
        if (!supplierObjectId) {
            return res.status(400).json({ success: false, message: 'supplierId is required' });
        }

        const kg = Number(requestedKg);
        if (!Number.isFinite(kg) || kg <= 0) {
            return res.status(400).json({ success: false, message: 'requestedKg must be > 0' });
        }

        const supplier = await Supplier.findById(supplierObjectId).select('name email userId');
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }

        const requestDoc = await LeafSupplyRequest.create({
            supplierId: supplierObjectId,
            createdBy,
            requestedKg: kg,
            requestedForAt: requestedForAt ? new Date(requestedForAt) : undefined,
            pickupLocation: pickupLocation ? String(pickupLocation).trim() : undefined,
            notes: notes ? String(notes).trim() : undefined,
            status: 'PENDING',
        });

        // Email notification (best-effort)
        try {
            let to = (supplier.email || '').toLowerCase().trim();
            if (!to && supplier.userId) {
                const user = await User.findById(supplier.userId).select('email');
                to = (user?.email || '').toLowerCase().trim();
            }

            if (to && to.includes('@')) {
                await sendEmail({
                    to,
                    subject: 'New Tea Leaf Supply Request',
                    html: buildRequestEmailHtml({
                        supplierName: supplier.name,
                        requestedKg: kg,
                        requestedForAt,
                        pickupLocation: pickupLocation,
                        notes,
                    }),
                });
            } else {
                console.warn('[leafSupplyRequest] Skipping email notification: No valid email for supplier', supplier.name);
            }
        } catch (emailErr) {
            console.warn('[leafSupplyRequest] Email send failed:', emailErr?.message || emailErr);
        }

        const populated = await LeafSupplyRequest.findById(requestDoc._id)
            .populate('supplierId', 'supplierCode name email contactNumber')
            .populate('createdBy', 'email firstName lastName');

        return res.status(201).json({
            success: true,
            message: 'Leaf supply request created',
            data: populated,
        });
    } catch (error) {
        console.error('Error creating leaf supply request:', error);
        return res.status(500).json({ success: false, message: 'Error creating leaf supply request', error: error.message });
    }
};

// GET /api/leaf-supply-requests/mine
exports.getMyRequests = async (req, res) => {
    try {
        const createdBy = req.user?.userId;
        const { page = 0, limit = 10, status } = req.query;

        const query = { createdBy };
        if (status) query.status = String(status).toUpperCase();

        const skip = parseInt(page) * parseInt(limit);

        const items = await LeafSupplyRequest.find(query)
            .populate('supplierId', 'supplierCode name email contactNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LeafSupplyRequest.countDocuments(query);

        return res.status(200).json({
            success: true,
            content: items,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('Error fetching my leaf supply requests:', error);
        return res.status(500).json({ success: false, message: 'Error fetching requests', error: error.message });
    }
};

// GET /api/leaf-supply-requests/inbox
exports.getSupplierInbox = async (req, res) => {
    try {
        const supplier = await resolveSupplierFromAuth(req);
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found for this user'
            });
        }

        const { page = 0, limit = 10, status } = req.query;
        const query = { supplierId: supplier._id };
        if (status) query.status = String(status).toUpperCase();

        const skip = parseInt(page) * parseInt(limit);

        const items = await LeafSupplyRequest.find(query)
            .populate('createdBy', 'email firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LeafSupplyRequest.countDocuments(query);

        return res.status(200).json({
            success: true,
            content: items,
            totalElements: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('Error fetching supplier inbox requests:', error);
        return res.status(500).json({ success: false, message: 'Error fetching inbox', error: error.message });
    }
};

// PATCH /api/leaf-supply-requests/:id/confirm
exports.confirmRequest = async (req, res) => {
    try {
        const supplier = await resolveSupplierFromAuth(req);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier profile not found for this user' });
        }

        const requestId = toObjectIdOrNull(req.params.id);
        if (!requestId) return res.status(400).json({ success: false, message: 'Invalid request id' });

        const doc = await LeafSupplyRequest.findById(requestId);
        if (!doc) return res.status(404).json({ success: false, message: 'Request not found' });

        if (String(doc.supplierId) !== String(supplier._id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (doc.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Cannot confirm when status is ${doc.status}` });
        }

        doc.status = 'CONFIRMED';
        doc.confirmedAt = new Date();
        await doc.save();

        // Send confirmation emails (non-blocking)
        try {
            const { sendEmail } = require('../utils/mailer');
            
            // 1. Notify Inventory Manager
            const manager = await User.findById(doc.createdBy).lean();
            if (manager?.email) {
                await sendEmail({
                    to: manager.email,
                    subject: `✅ Tea Leaf Supply Request Confirmed — ${supplier.name}`,
                    html: buildConfirmationEmailHtml({
                        managerName: manager.firstName ? `${manager.firstName} ${manager.lastName || ''}`.trim() : manager.email,
                        supplierName: supplier.name,
                        requestedKg: doc.requestedKg,
                        requestedForAt: doc.requestedForAt,
                        pickupLocation: doc.pickupLocation,
                        confirmedAt: doc.confirmedAt,
                    }),
                });
                console.log(`[confirmRequest] Confirmation email sent to manager: ${manager.email}`);
            }

            // 2. Thank the Supplier
            let supplierEmail = (supplier.email || '').toLowerCase().trim();
            if (!supplierEmail && supplier.userId) {
                const sUser = await User.findById(supplier.userId).select('email');
                supplierEmail = (sUser?.email || '').toLowerCase().trim();
            }

            if (supplierEmail) {
                await sendEmail({
                    to: supplierEmail,
                    subject: '🙏 Thank You for Confirming Your Supply Request',
                    html: buildThankYouForConfirmingEmailHtml({
                        supplierName: supplier.name,
                        requestedKg: doc.requestedKg,
                        requestedForAt: doc.requestedForAt,
                        pickupLocation: doc.pickupLocation,
                    }),
                });
                console.log(`[confirmRequest] Thank-you email sent to supplier: ${supplierEmail}`);
            }
        } catch (mailErr) {
            console.warn('[confirmRequest] Email send failed (non-fatal):', mailErr.message);
        }

        return res.status(200).json({ success: true, message: 'Request confirmed', data: doc });
    } catch (error) {
        console.error('Error confirming request:', error);
        return res.status(500).json({ success: false, message: 'Error confirming request', error: error.message });
    }
};

// PATCH /api/leaf-supply-requests/:id/reject
exports.rejectRequest = async (req, res) => {
    try {
        const supplier = await resolveSupplierFromAuth(req);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier profile not found for this user' });
        }

        const requestId = toObjectIdOrNull(req.params.id);
        if (!requestId) return res.status(400).json({ success: false, message: 'Invalid request id' });

        const { reason } = req.body || {};
        const rejectionReason = String(reason || '').trim();
        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const doc = await LeafSupplyRequest.findById(requestId);
        if (!doc) return res.status(404).json({ success: false, message: 'Request not found' });

        if (String(doc.supplierId) !== String(supplier._id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (doc.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Cannot reject when status is ${doc.status}` });
        }

        doc.status = 'REJECTED';
        doc.rejectedAt = new Date();
        doc.rejectionReason = rejectionReason;
        await doc.save();

        return res.status(200).json({ success: true, message: 'Request rejected', data: doc });
    } catch (error) {
        console.error('Error rejecting request:', error);
        return res.status(500).json({ success: false, message: 'Error rejecting request', error: error.message });
    }
};

// PATCH /api/leaf-supply-requests/:id/receive
exports.receiveRequest = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const requestId = toObjectIdOrNull(req.params.id);
        if (!requestId) return res.status(400).json({ success: false, message: 'Invalid request id' });

        const { actualReceivedKg } = req.body || {};
        const receivedKg = Number(actualReceivedKg);
        if (!Number.isFinite(receivedKg) || receivedKg <= 0) {
            return res.status(400).json({ success: false, message: 'actualReceivedKg must be > 0' });
        }

        const doc = await LeafSupplyRequest.findById(requestId);
        if (!doc) return res.status(404).json({ success: false, message: 'Request not found' });

        // Only the inventory manager who created can receive
        if (String(doc.createdBy) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (doc.status !== 'CONFIRMED') {
            return res.status(400).json({ success: false, message: `Cannot receive when status is ${doc.status}` });
        }

        if (doc.teaLeafEntryId) {
            return res.status(400).json({ success: false, message: 'This request has already been received' });
        }

        const supplier = await Supplier.findById(doc.supplierId);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }

        const { bagWeight, waterWeight, coarseLeafWeight, notes } = req.body || {};

        // Create stock entry (TeaLeafEntry)
        const { entry, netWeight, netAmount, ratePerKg } = await createTeaLeafEntryFromReceipt({
            supplierDoc: supplier,
            receivedKg,
            recordedByUserId: userId,
            receivedAt: new Date(),
            manualDeductions: {
                bagWeight: typeof bagWeight === 'number' ? bagWeight : undefined,
                waterWeight: typeof waterWeight === 'number' ? waterWeight : undefined,
                coarseLeafWeight: typeof coarseLeafWeight === 'number' ? coarseLeafWeight : undefined,
                notes: notes ? String(notes).trim() : undefined
            }
        });

        doc.status = 'RECEIVED';
        doc.receivedAt = new Date();
        doc.actualReceivedKg = receivedKg;
        doc.teaLeafEntryId = entry._id;
        await doc.save();

        const populated = await LeafSupplyRequest.findById(doc._id)
            .populate('supplierId', 'supplierCode name email contactNumber')
            .populate('createdBy', 'email firstName lastName')
            .populate('teaLeafEntryId');

        // Send receipt email to supplier (non-blocking)
        try {
            const { sendEmail } = require('../utils/mailer');
            let supplierEmail = (supplier.email || '').toLowerCase().trim();
            if (!supplierEmail && supplier.userId) {
                const sUser = await User.findById(supplier.userId).select('email');
                supplierEmail = (sUser?.email || '').toLowerCase().trim();
            }

            if (supplierEmail) {
                await sendEmail({
                    to: supplierEmail,
                    subject: '🍃 Your Tea Leaf Supply Has Been Received — GreenLeaf Factory',
                    html: buildReceivedEmailHtml({
                        supplierName: supplier.name,
                        receivedKg,
                        netWeight,
                        netAmount,
                        ratePerKg,
                        receivedAt: doc.receivedAt,
                    }),
                });
                console.log(`[receiveRequest] Receipt email sent to supplier: ${supplierEmail}`);
            }
        } catch (mailErr) {
            console.warn('[receiveRequest] Email send failed (non-fatal):', mailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Request received and stock updated',
            data: populated,
        });
    } catch (error) {
        console.error('Error receiving request:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Error receiving request',
        });
    }
};

