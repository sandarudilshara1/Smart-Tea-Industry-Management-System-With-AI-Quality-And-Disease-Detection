const Employee = require('../models/Employee');

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Owner only)
exports.createEmployee = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            salary,
            hireDate,
            address,
            city,
            status
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !position || !department || !salary || !hireDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if employee with email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }

        // Create employee
        const employee = await Employee.create({
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            salary,
            hireDate,
            address: address || '',
            city: city || '',
            status: status || 'Active',
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                employee
            }
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating employee',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getAllEmployees = async (req, res) => {
    try {
        const { department, status, search } = req.query;

        let query = {};

        // Filter by department if provided
        if (department && department !== 'All') {
            query.department = department;
        }

        // Filter by status if provided
        if (status && status !== 'All') {
            query.status = status;
        }

        // Search by name, email, or position
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { position: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: employees.length,
            data: {
                employees
            }
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employees',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-__v');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                employee
            }
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employee',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Owner only)
exports.updateEmployee = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            salary,
            hireDate,
            address,
            city,
            status
        } = req.body;

        let employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if email is being changed and if new email already exists
        if (email && email !== employee.email) {
            const existingEmployee = await Employee.findOne({ email });
            if (existingEmployee) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee with this email already exists'
                });
            }
        }

        // Update fields
        employee.firstName = firstName || employee.firstName;
        employee.lastName = lastName || employee.lastName;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.position = position || employee.position;
        employee.department = department || employee.department;
        employee.salary = salary !== undefined ? salary : employee.salary;
        employee.hireDate = hireDate || employee.hireDate;
        employee.address = address !== undefined ? address : employee.address;
        employee.city = city !== undefined ? city : employee.city;
        employee.status = status || employee.status;

        await employee.save();

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: {
                employee
            }
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating employee',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Owner only)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        await employee.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting employee',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private
exports.getEmployeeStats = async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        const active = await Employee.countDocuments({ status: 'Active' });
        const onLeave = await Employee.countDocuments({ status: 'On Leave' });
        const inactive = await Employee.countDocuments({ status: 'Inactive' });

        const byDepartment = await Employee.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    total,
                    active,
                    onLeave,
                    inactive,
                    byDepartment
                }
            }
        });
    } catch (error) {
        console.error('Get employee stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employee statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
