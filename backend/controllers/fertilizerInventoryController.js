const FertilizerInventoryTransaction = require('../models/FertilizerInventoryTransaction');
const FertilizerCompany = require('../models/FertilizerCompany');
const FertilizerRequest = require('../models/FertilizerRequest');
const { sendEmail } = require('../utils/mailer');

const getActorUserId = (req) => req?.user?.userId || req?.user?.id || req?.user?._id;

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const computeAvailableKgForCategory = async (categoryName) => {
  const rows = await FertilizerInventoryTransaction.aggregate([
    { $match: { categoryName } },
    {
      $group: {
        _id: '$categoryName',
        inKg: {
          $sum: {
            $cond: [{ $eq: ['$type', 'IN'] }, '$kg', 0],
          },
        },
        outKg: {
          $sum: {
            $cond: [{ $eq: ['$type', 'OUT'] }, '$kg', 0],
          },
        },
      },
    },
  ]);

  if (!rows || rows.length === 0) return 0;
  const inKg = rows[0].inKg || 0;
  const outKg = rows[0].outKg || 0;
  return inKg - outKg;
};

// POST /api/fertilizer-inventory/receive
exports.receiveStock = async (req, res) => {
  try {
    const userId = getActorUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      categoryName,
      companyId,
      companyName: companyNameInput,
      kg,
      unitPrice,
      totalPrice,
      eventAt,
      note,
    } = req.body;

    const kgNumber = toNumber(kg);
    const unitPriceNumber = toNumber(unitPrice);
    const totalPriceNumber = toNumber(totalPrice);

    if (!categoryName || String(categoryName).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'categoryName is required' });
    }

    if (!kgNumber || kgNumber <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'kg must be a positive number' });
    }

    let company = null;
    if (companyId) {
      company = await FertilizerCompany.findById(companyId).select('name');
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: 'Fertilizer company not found' });
      }
    }

    const computedTotal =
      totalPriceNumber !== null
        ? totalPriceNumber
        : unitPriceNumber !== null
          ? unitPriceNumber * kgNumber
          : null;

    const tx = await FertilizerInventoryTransaction.create({
      type: 'IN',
      categoryName: String(categoryName).trim(),
      companyId: company ? company._id : companyId || null,
      companyName: company ? company.name : companyNameInput || null,
      kg: kgNumber,
      unitPrice: unitPriceNumber,
      totalPrice: computedTotal,
      eventAt: eventAt ? new Date(eventAt) : new Date(),
      note: note || null,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Stock received successfully',
      data: tx,
    });
  } catch (error) {
    console.error('Receive stock error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error receiving stock',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// POST /api/fertilizer-inventory/use
exports.recordUsage = async (req, res) => {
  try {
    const userId = getActorUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { categoryName, kg, purpose, eventAt, note } = req.body;

    const kgNumber = toNumber(kg);

    if (!categoryName || String(categoryName).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'categoryName is required' });
    }

    if (!kgNumber || kgNumber <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'kg must be a positive number' });
    }

    if (!purpose || String(purpose).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'purpose is required' });
    }

    const normalizedCategoryName = String(categoryName).trim();

    const availableKg = await computeAvailableKgForCategory(normalizedCategoryName);
    if (kgNumber > availableKg) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available ${availableKg} kg`,
        availableKg,
      });
    }

    const tx = await FertilizerInventoryTransaction.create({
      type: 'OUT',
      categoryName: normalizedCategoryName,
      kg: kgNumber,
      purpose: String(purpose).trim(),
      eventAt: eventAt ? new Date(eventAt) : new Date(),
      note: note || null,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Usage recorded successfully',
      data: tx,
    });
  } catch (error) {
    console.error('Record usage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error recording usage',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// GET /api/fertilizer-inventory/summary
exports.getSummary = async (req, res) => {
  try {
    const rows = await FertilizerInventoryTransaction.aggregate([
      {
        $group: {
          _id: '$categoryName',
          inKg: {
            $sum: { $cond: [{ $eq: ['$type', 'IN'] }, '$kg', 0] },
          },
          outKg: {
            $sum: { $cond: [{ $eq: ['$type', 'OUT'] }, '$kg', 0] },
          },
          lastEventAt: { $max: '$eventAt' },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: '$_id',
          inKg: 1,
          outKg: 1,
          availableKg: { $subtract: ['$inKg', '$outKg'] },
          lastEventAt: 1,
        },
      },
      { $sort: { categoryName: 1 } },
    ]);

    const requests = await FertilizerRequest.aggregate([
      {
        $group: {
          _id: '$categoryName',
          requestedKg: {
            $sum: { $cond: [{ $in: ['$status', ['Pending', 'Approved']] }, '$kg', 0] },
          },
        },
      },
    ]);

    const requestMap = requests.reduce((acc, req) => {
      acc[req._id] = req.requestedKg;
      return acc;
    }, {});

    const mergedRows = rows.map(row => ({
      ...row,
      requestedKg: requestMap[row.categoryName] || 0
    }));

    // Add any categories that have requests but no transactions yet
    requests.forEach(req => {
      if (!mergedRows.find(r => r.categoryName === req._id)) {
        mergedRows.push({
          categoryName: req._id,
          inKg: 0,
          outKg: 0,
          availableKg: 0,
          lastEventAt: null,
          requestedKg: req.requestedKg
        });
      }
    });

    mergedRows.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    const totalAvailableKg = mergedRows.reduce(
      (sum, r) => sum + (r.availableKg || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalAvailableKg,
        categories: mergedRows,
      },
    });
  } catch (error) {
    console.error('Get fertilizer summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching fertilizer inventory summary',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// GET /api/fertilizer-inventory/transactions
exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 20,
      type,
      categoryName,
      companyId,
      from,
      to,
    } = req.query;

    const pageNumber = Math.max(0, parseInt(page, 10) || 0);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const query = {};
    if (type) query.type = type;
    if (categoryName) query.categoryName = String(categoryName).trim();
    if (companyId) query.companyId = companyId;

    if (from || to) {
      query.eventAt = {};
      if (from) query.eventAt.$gte = new Date(from);
      if (to) query.eventAt.$lte = new Date(to);
    }

    const skip = pageNumber * pageLimit;

    const [content, totalElements] = await Promise.all([
      FertilizerInventoryTransaction.find(query)
        .sort({ eventAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .select('-__v'),
      FertilizerInventoryTransaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / pageLimit),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Get fertilizer transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching fertilizer inventory transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// POST /api/fertilizer-inventory/request
exports.requestStock = async (req, res) => {
  try {
    const userId = getActorUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { companyId, categoryName, kg, expectedDate, note } = req.body;
    const kgNumber = toNumber(kg);

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }
    if (!categoryName || String(categoryName).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'categoryName is required' });
    }
    if (!kgNumber || kgNumber <= 0) {
      return res.status(400).json({ success: false, message: 'kg must be a positive number' });
    }

    const company = await FertilizerCompany.findById(companyId).select('name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Fertilizer company not found' });
    }

    const request = await FertilizerRequest.create({
      companyId,
      companyName: company.name,
      categoryName: String(categoryName).trim(),
      kg: kgNumber,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      note: note || null,
      createdBy: userId,
    });

    if (company.email) {
      const categoryNameClean = String(categoryName).trim();
      const expectedDateStr = expectedDate ? new Date(expectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
      const requestedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fertilizer Request</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#01251F 0%,#165E52 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:50%;padding:14px;margin-bottom:14px;">
              <span style="font-size:36px;">🌿</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Green Leaf Tea</h1>
            <p style="margin:6px 0 0;color:#a8d5c9;font-size:14px;letter-spacing:0.5px;">FERTILIZER MANAGEMENT SYSTEM</p>
          </td>
        </tr>

        <!-- Body Card -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-left:1px solid #d4ede8;border-right:1px solid #d4ede8;">
            <h2 style="margin:0 0 8px;color:#01251F;font-size:22px;font-weight:700;">New Fertilizer Order Request</h2>
            <p style="margin:0 0 28px;color:#4a7a6d;font-size:15px;">A purchase order has been placed from <strong>Green Leaf Tea Industry</strong>. Please review the details below and process accordingly.</p>

            <!-- Badge -->
            <div style="display:inline-block;background:#e1f4ef;color:#165E52;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;border:1px solid #b3dfd6;margin-bottom:28px;">&#128230; Order Pending Fulfillment</div>

            <!-- Details Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #d4ede8;">
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;width:40%;border-bottom:1px solid #d4ede8;">Fertilizer Category</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;font-weight:600;border-bottom:1px solid #d4ede8;">${categoryNameClean}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Quantity Requested</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;font-weight:700;border-bottom:1px solid #d4ede8;">${kgNumber} kg</td>
              </tr>
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Expected Delivery</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;border-bottom:1px solid #d4ede8;">${expectedDateStr}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Request Date</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;border-bottom:1px solid #d4ede8;">${requestedOn}</td>
              </tr>
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;">Additional Notes</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;font-style:${note ? 'normal' : 'italic'};">${note || 'No additional notes'}</td>
              </tr>
            </table>

            <!-- Action Note -->
            <div style="margin-top:28px;padding:18px 20px;background:#e1f4ef;border-left:4px solid #165E52;border-radius:0 8px 8px 0;">
              <p style="margin:0;color:#01251F;font-size:14px;line-height:1.6;">Please confirm receipt of this order and coordinate delivery by the expected date. Our inventory team will update the system upon delivery confirmation.</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#01251F;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#a8d5c9;font-size:13px;">This is an automated notification from Green Leaf Tea Industry Management System.</p>
            <p style="margin:0;color:#4a7a6d;font-size:12px;">Please do not reply to this email directly.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      sendEmail({
        to: company.email,
        subject: `📦 Fertilizer Order Request — ${kgNumber}kg of ${categoryNameClean}`,
        html: emailHtml,
        text: `Dear ${company.name}, A new fertilizer request has been placed. Category: ${categoryNameClean}, Quantity: ${kgNumber} kg, Expected Date: ${expectedDateStr}, Notes: ${note || 'None'}.`,
      }).catch(err => console.error('Failed to send fertilizer request email:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Fertilizer request submitted successfully',
      data: request,
    });
  } catch (error) {
    console.error('Request stock error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error requesting stock',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// GET /api/fertilizer-inventory/requests
exports.getRequests = async (req, res) => {
  try {
    const { page = 0, limit = 20, status, companyId } = req.query;

    const pageNumber = Math.max(0, parseInt(page, 10) || 0);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const query = {};
    if (status) query.status = status;
    if (companyId) query.companyId = companyId;

    const skip = pageNumber * pageLimit;

    const [content, totalElements] = await Promise.all([
      FertilizerRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .select('-__v'),
      FertilizerRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / pageLimit),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Get fertilizer requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching fertilizer requests',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};

// PUT /api/fertilizer-inventory/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = getActorUserId(req);

    if (!['Pending', 'Approved', 'Received', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await FertilizerRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Add stock to inventory when marked as received (if not already received)
    if (status === 'Received' && request.status !== 'Received') {
      await FertilizerInventoryTransaction.create({
        type: 'IN',
        categoryName: request.categoryName,
        kg: request.kg,
        purpose: 'Request fulfilled',
        eventAt: new Date(),
        companyId: request.companyId,
        note: request.note,
        createdBy: userId || request.createdBy,
      });

      // Send confirmation email to the company
      const company = await FertilizerCompany.findById(request.companyId).select('name email');
      if (company && company.email) {
        const receivedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const originalDate = request.expectedDate
          ? new Date(request.expectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'N/A';

        const confirmHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Received Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#01251F 0%,#165E52 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:50%;padding:14px;margin-bottom:14px;">
              <span style="font-size:36px;">✅</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Green Leaf Tea</h1>
            <p style="margin:6px 0 0;color:#a8d5c9;font-size:14px;letter-spacing:0.5px;">FERTILIZER MANAGEMENT SYSTEM</p>
          </td>
        </tr>

        <!-- Body Card -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-left:1px solid #d4ede8;border-right:1px solid #d4ede8;">
            <h2 style="margin:0 0 8px;color:#01251F;font-size:22px;font-weight:700;">Order Received — Thank You!</h2>
            <p style="margin:0 0 28px;color:#4a7a6d;font-size:15px;">Dear <strong>${company.name}</strong>, we are pleased to confirm that your fertilizer delivery has been successfully received and recorded in our inventory system.</p>

            <!-- Success Badge -->
            <div style="display:inline-block;background:#d1f5e0;color:#0a6c3b;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;border:1px solid #8ed4aa;margin-bottom:28px;">&#10003; Delivery Confirmed & Inventory Updated</div>

            <!-- Details Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #d4ede8;">
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;width:40%;border-bottom:1px solid #d4ede8;">Fertilizer Category</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;font-weight:600;border-bottom:1px solid #d4ede8;">${request.categoryName}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Quantity Received</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;font-weight:700;border-bottom:1px solid #d4ede8;">${request.kg} kg</td>
              </tr>
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Date Received</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;border-bottom:1px solid #d4ede8;">${receivedOn}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;border-bottom:1px solid #d4ede8;">Original Expected Date</td>
                <td style="padding:12px 20px;font-size:14px;color:#1a3a32;border-bottom:1px solid #d4ede8;">${originalDate}</td>
              </tr>
              <tr style="background:#e8f5f1;">
                <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#165E52;">Order Status</td>
                <td style="padding:12px 20px;">
                  <span style="background:#d1f5e0;color:#0a6c3b;font-size:12px;font-weight:700;padding:4px 12px;border-radius:12px;text-transform:uppercase;letter-spacing:0.5px;">RECEIVED</span>
                </td>
              </tr>
            </table>

            <!-- Info Note -->
            <div style="margin-top:28px;padding:18px 20px;background:#e1f4ef;border-left:4px solid #165E52;border-radius:0 8px 8px 0;">
              <p style="margin:0;color:#01251F;font-size:14px;line-height:1.6;">The received stock has been added to our active inventory. We appreciate your prompt service and look forward to continuing our partnership. Thank you for supplying quality fertilizers to Green Leaf Tea Industry.</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#01251F;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#a8d5c9;font-size:13px;">This is an automated notification from Green Leaf Tea Industry Management System.</p>
            <p style="margin:0;color:#4a7a6d;font-size:12px;">Please do not reply to this email directly.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        sendEmail({
          to: company.email,
          subject: `✅ Order Received — ${request.kg}kg of ${request.categoryName} Confirmed`,
          html: confirmHtml,
          text: `Dear ${company.name}, we confirm receipt of ${request.kg}kg of ${request.categoryName} on ${receivedOn}. Thank you for your delivery. The stock has been added to our inventory.`,
        }).catch(err => console.error('Failed to send order received confirmation email:', err));
      }
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      data: request,
    });
  } catch (error) {
    console.error('Update request status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating request status',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
};
