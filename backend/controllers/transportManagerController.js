const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');

// @desc    Transport Manager dashboard summary
// @route   GET /api/transport-manager/dashboard
// @access  Private (Transport Manager, Owner)
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalRoutes,
            activeTrips,
            approvedDrivers,
            pendingDrivers,
            alertsVehicles,
            recentTripDrivers
        ] = await Promise.all([
            Route.countDocuments({ status: 'Active' }),
            Driver.countDocuments({
                isActive: true,
                'currentTrip.routeId': { $exists: true, $ne: null },
                'currentTrip.status': { $nin: ['Not Started', 'Completed'] }
            }),
            Driver.countDocuments({ isActive: true, status: { $ne: 'Inactive' } }),
            Driver.find({ isActive: true, status: 'Inactive' })
                .select('name createdAt')
                .sort({ createdAt: -1 })
                .limit(6),
            Vehicle.find({ isActive: true, status: { $in: ['Maintenance', 'Unavailable'] } })
                .select('vehicleNumber status assignedDriver updatedAt')
                .sort({ updatedAt: -1 })
                .limit(6),
            Driver.find({
                isActive: true,
                'currentTrip.routeId': { $exists: true, $ne: null }
            })
                .select('name currentTrip updatedAt')
                .sort({ 'currentTrip.lastUpdate': -1, updatedAt: -1 })
                .limit(8)
        ]);

        const pendingDriversOut = pendingDrivers.map(d => ({
            id: d._id,
            name: d.name,
            appliedOn: d.createdAt
        }));

        const alertsOut = alertsVehicles.map(v => ({
            id: v.vehicleNumber,
            status: v.status,
            driver: v.assignedDriver || null
        }));

        const recentTripsOut = recentTripDrivers.map(d => {
            const tripStatus = d.currentTrip?.status;
            const badgeStatus = tripStatus === 'Completed'
                ? 'Completed'
                : tripStatus === 'Not Started'
                    ? 'Pending'
                    : 'Ongoing';

            return {
                route: d.currentTrip?.routeName || '—',
                driver: d.name,
                vehicle: d.currentTrip?.vehicleNo || '—',
                status: badgeStatus,
                rawStatus: tripStatus || null,
                lastUpdate: d.currentTrip?.lastUpdate || d.updatedAt
            };
        });

        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalRoutes,
                    activeTrips,
                    approvedDrivers
                },
                alerts: alertsOut,
                pendingDrivers: pendingDriversOut,
                recentTrips: recentTripsOut
            }
        });
    } catch (error) {
        console.error('Transport dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching transport dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
