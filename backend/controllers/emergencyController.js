const Emergency = require('../models/Emergency');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

function normalizeVehicleNo(value) {
    return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

async function resolveDriverFromAuth(req) {
    const authUserId = req.user?.userId || req.user?.id;
    if (!authUserId) return null;

    let driver = await Driver.findOne({ userId: authUserId, isActive: true });
    if (driver) return driver;

    const user = await User.findById(authUserId).select('email');
    const email = (user?.email || '').toLowerCase().trim();
    if (!email) return null;

    driver = await Driver.findOne({ email, isActive: true });
    if (driver && !driver.userId) {
        driver.userId = authUserId;
        await driver.save();
    }

    return driver;
}

async function getTransportManagerRecipients() {
    const users = await User.find({
        isActive: true,
        role: { $in: ['transport_manager', 'owner'] },
        email: { $exists: true, $ne: null },
    }).select('email');

    return users
        .map((u) => (u.email || '').toLowerCase().trim())
        .filter(Boolean);
}

// POST /api/emergencies/report
// Driver reports emergency/breakdown.
exports.reportEmergency = async (req, res) => {
    try {
        const driver = await resolveDriverFromAuth(req);
        if (!driver) {
            return res.status(400).json({ success: false, message: 'Driver profile not found. Contact Transport Manager.' });
        }

        if (!driver.currentTrip || !driver.currentTrip.routeId) {
            return res.status(400).json({ success: false, message: 'No active route assigned to this driver.' });
        }

        const tripStatus = driver.currentTrip.status;
        if (!tripStatus || ['Completed'].includes(tripStatus)) {
            return res.status(400).json({ success: false, message: 'No active trip to report an emergency for.' });
        }

        const vehicleNumber = normalizeVehicleNo(driver.currentTrip.vehicleNo);
        if (!vehicleNumber || vehicleNumber === 'NOT ASSIGNED') {
            return res.status(400).json({ success: false, message: 'No vehicle assigned to this trip.' });
        }

        // Prevent duplicate open emergency reports for the same active trip.
        const existingOpen = await Emergency.findOne({
            reportedByDriverId: driver._id,
            routeId: driver.currentTrip.routeId,
            status: { $nin: ['Resolved', 'Cancelled'] },
        }).sort({ createdAt: -1 });
        if (existingOpen) {
            return res.status(400).json({
                success: false,
                message: 'An emergency report already exists for your current trip. Please wait for the Transport Manager response.',
                data: { emergency: existingOpen },
            });
        }

        const issueType = req.body.issueType || 'Breakdown';
        const severity = req.body.severity || 'Medium';
        const description = (req.body.description || '').trim();
        const locationText = (req.body.locationText || '').trim();

        if (!description) {
            return res.status(400).json({ success: false, message: 'Please provide a description of the issue.' });
        }

        const authUserId = req.user?.userId || req.user?.id;

        const emergency = await Emergency.create({
            reportedByDriverId: driver._id,
            reportedByUserId: authUserId || undefined,
            driverName: driver.name,
            driverEmail: (driver.email || '').toLowerCase(),
            vehicleNumber,
            routeId: driver.currentTrip.routeId,
            routeName: driver.currentTrip.routeName,
            tripStatusAtReport: tripStatus,
            issueType,
            severity,
            description,
            locationText: locationText || undefined,
            status: 'Reported',
        });

        // Mark the broken vehicle as Maintenance and clear assignment to avoid being selectable.
        const vehicleDoc = await Vehicle.findOne({ vehicleNumber, isActive: true });
        if (vehicleDoc) {
            vehicleDoc.status = 'Maintenance';
            vehicleDoc.driverId = null;
            vehicleDoc.assignedDriver = null;
            await vehicleDoc.save();
        }

        // Email notification (best-effort)
        try {
            const recipients = await getTransportManagerRecipients();
            await sendEmail({
                to: recipients,
                subject: `Emergency reported: ${vehicleNumber} (${issueType})`,
                text:
                    `A driver reported an emergency.\n\n` +
                    `Driver: ${driver.name} (${driver.email})\n` +
                    `Vehicle: ${vehicleNumber}\n` +
                    `Route: ${driver.currentTrip.routeName || driver.currentTrip.routeId}\n` +
                    `Trip status: ${tripStatus}\n` +
                    `Severity: ${severity}\n` +
                    (locationText ? `Location: ${locationText}\n` : '') +
                    `\nDescription:\n${description}\n\n` +
                    `Please assign a replacement from the Transport Manager Emergency page.`,
            });
        } catch (emailErr) {
            console.warn('[emergency] Failed to send report email:', emailErr?.message || emailErr);
        }

        return res.status(201).json({ success: true, message: 'Emergency reported successfully', data: { emergency } });
    } catch (error) {
        console.error('Report emergency error:', error);
        return res.status(500).json({ success: false, message: 'Server error reporting emergency' });
    }
};

// GET /api/emergencies?status=Reported
exports.getEmergencies = async (req, res) => {
    try {
        const { status } = req.query;

        const query = {};
        if (status && status !== 'All') query.status = status;

        const emergencies = await Emergency.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ success: true, count: emergencies.length, data: { emergencies } });
    } catch (error) {
        console.error('Get emergencies error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching emergencies' });
    }
};

// GET /api/emergencies/my
exports.getMyEmergencies = async (req, res) => {
    try {
        const driver = await resolveDriverFromAuth(req);
        if (!driver) {
            return res.status(400).json({ success: false, message: 'Driver profile not found.' });
        }

        const emergencies = await Emergency.find({ reportedByDriverId: driver._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({ success: true, count: emergencies.length, data: { emergencies } });
    } catch (error) {
        console.error('Get my emergencies error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching emergencies' });
    }
};

// PATCH /api/emergencies/:id/assign-replacement
exports.assignReplacement = async (req, res) => {
    try {
        const replacementVehicleNumber = normalizeVehicleNo(req.body.replacementVehicleNumber);
        const assignmentNote = (req.body.assignmentNote || '').trim();

        if (!replacementVehicleNumber) {
            return res.status(400).json({ success: false, message: 'replacementVehicleNumber is required' });
        }

        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return res.status(404).json({ success: false, message: 'Emergency report not found' });
        }

        if (['Resolved', 'Cancelled'].includes(emergency.status)) {
            return res.status(400).json({ success: false, message: `Cannot assign replacement for a ${emergency.status} emergency.` });
        }

        if (replacementVehicleNumber === emergency.vehicleNumber) {
            return res.status(400).json({ success: false, message: 'Replacement vehicle must be different from the broken vehicle.' });
        }

        // Ensure replacement vehicle is available
        const replacementVehicle = await Vehicle.findOne({ vehicleNumber: replacementVehicleNumber, isActive: true });
        if (!replacementVehicle) {
            return res.status(400).json({ success: false, message: `Vehicle ${replacementVehicleNumber} not found.` });
        }

        if (replacementVehicle.status !== 'Available') {
            return res.status(400).json({ success: false, message: `Vehicle ${replacementVehicleNumber} is not available (status: ${replacementVehicle.status}).` });
        }

        // Update driver trip vehicleNo (if still active)
        const driver = await Driver.findById(emergency.reportedByDriverId);
        if (driver && driver.currentTrip && driver.currentTrip.routeId && driver.currentTrip.status !== 'Completed') {
            const prevVehicleNo = normalizeVehicleNo(driver.currentTrip.vehicleNo);

            driver.currentTrip.vehicleNo = replacementVehicleNumber;
            driver.currentTrip.lastUpdate = new Date();
            await driver.save();

            // If changing from a previous vehicle (e.g., reassign replacement), release the previous vehicle
            // only if it is assigned to this driver.
            if (prevVehicleNo && prevVehicleNo !== 'NOT ASSIGNED' && prevVehicleNo !== replacementVehicleNumber) {
                const prevVehicleDoc = await Vehicle.findOne({ vehicleNumber: prevVehicleNo, isActive: true });
                if (prevVehicleDoc && prevVehicleDoc.driverId && prevVehicleDoc.driverId.toString() === driver._id.toString()) {
                    prevVehicleDoc.status = 'Available';
                    prevVehicleDoc.driverId = null;
                    prevVehicleDoc.assignedDriver = null;
                    await prevVehicleDoc.save();
                }
            }

            // Reserve replacement vehicle
            replacementVehicle.status = 'In Use';
            replacementVehicle.driverId = driver._id;
            replacementVehicle.assignedDriver = driver.name;
            await replacementVehicle.save();
        }

        emergency.status = 'Replacement Assigned';
        emergency.replacementVehicleNumber = replacementVehicleNumber;
        emergency.assignedByUserId = req.user?.userId || req.user?.id || null;
        emergency.assignmentNote = assignmentNote || null;
        emergency.replacementAssignedAt = new Date();
        await emergency.save();

        // Email driver (best-effort)
        try {
            await sendEmail({
                to: emergency.driverEmail,
                subject: `Replacement assigned for ${emergency.vehicleNumber}`,
                text:
                    `A replacement vehicle has been assigned.\n\n` +
                    `Broken vehicle: ${emergency.vehicleNumber}\n` +
                    `Replacement vehicle: ${replacementVehicleNumber}\n` +
                    (assignmentNote ? `Note: ${assignmentNote}\n` : '') +
                    `\nPlease continue the trip with the replacement vehicle.`,
            });
        } catch (emailErr) {
            console.warn('[emergency] Failed to send replacement email:', emailErr?.message || emailErr);
        }

        return res.status(200).json({ success: true, message: 'Replacement assigned successfully', data: { emergency } });
    } catch (error) {
        console.error('Assign replacement error:', error);
        return res.status(500).json({ success: false, message: 'Server error assigning replacement' });
    }
};

// PATCH /api/emergencies/:id/status
exports.updateEmergencyStatus = async (req, res) => {
    try {
        const nextStatus = req.body.status;

        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return res.status(404).json({ success: false, message: 'Emergency report not found' });
        }

        if (!nextStatus || !['Reported', 'Acknowledged', 'Replacement Assigned', 'Resolved', 'Cancelled'].includes(nextStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        emergency.status = nextStatus;

        if (nextStatus === 'Acknowledged' && !emergency.acknowledgedAt) emergency.acknowledgedAt = new Date();
        if (nextStatus === 'Resolved') emergency.resolvedAt = new Date();
        if (nextStatus === 'Cancelled') emergency.cancelledAt = new Date();
        await emergency.save();

        // Notify driver when acknowledged (best-effort)
        if (nextStatus === 'Acknowledged') {
            try {
                await sendEmail({
                    to: emergency.driverEmail,
                    subject: `Emergency acknowledged: ${emergency.vehicleNumber}`,
                    text:
                        `Your emergency report has been acknowledged by the Transport Manager.\n\n` +
                        `Vehicle: ${emergency.vehicleNumber}\n` +
                        `Issue: ${emergency.issueType} (${emergency.severity})\n` +
                        `Status: ${nextStatus}\n\n` +
                        `Please wait for replacement assignment instructions.`,
                });
            } catch (emailErr) {
                console.warn('[emergency] Failed to send acknowledge email:', emailErr?.message || emailErr);
            }
        }

        // Optional: notify TM+Owner and driver when resolved/cancelled
        if (['Resolved', 'Cancelled'].includes(nextStatus)) {
            try {
                const recipients = await getTransportManagerRecipients();
                await sendEmail({
                    to: recipients,
                    subject: `Emergency ${nextStatus.toLowerCase()}: ${emergency.vehicleNumber}`,
                    text: `Emergency for vehicle ${emergency.vehicleNumber} has been marked as ${nextStatus}.`,
                });
                await sendEmail({
                    to: emergency.driverEmail,
                    subject: `Emergency ${nextStatus.toLowerCase()}: ${emergency.vehicleNumber}`,
                    text: `Your emergency report for vehicle ${emergency.vehicleNumber} has been marked as ${nextStatus}.`,
                });
            } catch (emailErr) {
                console.warn('[emergency] Failed to send status email:', emailErr?.message || emailErr);
            }
        }

        return res.status(200).json({ success: true, message: 'Emergency status updated', data: { emergency } });
    } catch (error) {
        console.error('Update emergency status error:', error);
        return res.status(500).json({ success: false, message: 'Server error updating emergency status' });
    }
};
