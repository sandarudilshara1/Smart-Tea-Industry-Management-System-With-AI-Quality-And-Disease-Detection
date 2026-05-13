const User = require('../models/User');

// @desc    Get all managers
// @route   GET /api/manager-info
// @access  Private
exports.getAllManagers = async (req, res) => {
    try {
        const managerRoles = [
            'factory_manager',
            'fertilizer_manager',
            'inventory_manager',
            'payment_manager',
            'transport_manager'
        ];

        // Single-tenant: return all staff with manager roles, no factory filtering needed
        const managers = await User.find({
            role: { $in: managerRoles }
        })
            .select('-password -__v')
            .sort({ createdAt: -1 });

        const formattedManagers = managers.map(manager => ({
            id: manager._id.toString(),
            name: `${manager.firstName} ${manager.lastName}`,
            email: manager.email,
            role: formatRole(manager.role),
            rawRole: manager.role,
            status: manager.isActive ? 'Active' : 'Suspended',
            phone: manager.phone,
            address: manager.address,
            nic: manager.nic
        }));

        res.status(200).json(formattedManagers);
    } catch (error) {
        console.error('Get all managers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching managers',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get managers by factory ID (kept for backward compat, now returns all)
// @route   GET /api/manager-info/:factoryId
// @access  Private
exports.getManagersByFactory = async (req, res) => {
    // Single-tenant: ignore factoryId param, delegate to getAllManagers logic
    return exports.getAllManagers(req, res);
};

// @desc    Update manager status (suspend/activate)
// @route   PATCH /api/manager-info/:id/status
// @access  Private (Owner only)
exports.updateManagerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const manager = await User.findById(id);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        manager.isActive = isActive;
        await manager.save();

        res.status(200).json({
            success: true,
            message: `Manager ${isActive ? 'activated' : 'suspended'} successfully`,
            data: {
                id: manager._id.toString(),
                name: `${manager.firstName} ${manager.lastName}`,
                status: manager.isActive ? 'Active' : 'Suspended'
            }
        });
    } catch (error) {
        console.error('Update manager status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating manager status',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete manager (permanent removal)
// @route   DELETE /api/manager-info/:id
// @access  Private (Owner only)
exports.deleteManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await User.findById(id);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        // Only allow deleting managers
        const managerRoles = [
            'factory_manager',
            'fertilizer_manager',
            'inventory_manager',
            'payment_manager',
            'transport_manager'
        ];

        if (!managerRoles.includes(manager.role)) {
            return res.status(403).json({
                success: false,
                message: 'Can only delete manager accounts'
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Manager deleted successfully',
            data: { id }
        });
    } catch (error) {
        console.error('Delete manager error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting manager',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// Helper function to format role for display
function formatRole(role) {
    const roleMap = {
        'factory_manager': 'Factory Manager',
        'fertilizer_manager': 'Fertilizer Manager',
        'inventory_manager': 'Inventory Manager',
        'payment_manager': 'Payment Manager',
        'transport_manager': 'Transport Manager'
    };
    return roleMap[role] || role;
}
