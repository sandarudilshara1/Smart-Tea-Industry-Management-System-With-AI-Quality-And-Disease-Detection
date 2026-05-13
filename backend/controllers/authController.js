const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, phone, address, nic } = req.body;

        // Validation
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, role, firstName, lastName'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Validate role
        const validRoles = ['owner', 'factory_manager', 'fertilizer_manager', 'inventory_manager',
                           'payment_manager', 'transport_manager', 'supplier', 'driver'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone: phone || '',
            address: address || '',
            nic: nic || '',
            isActive: true
        });

        // ── Auto-create Supplier profile when role is supplier ──────────────
        let supplierWarning = null;
        if (role === 'supplier') {
            try {
                const Supplier = require('../models/Supplier');

                // Check if a supplier with this email already exists (admin pre-registered them)
                let supplier = await Supplier.findOne({ email: email.toLowerCase() });

                if (supplier) {
                    // Link existing supplier profile to this new user account
                    supplier.userId = user._id;
                    await supplier.save();
                    console.log(`[register] Linked existing supplier "${supplier.name}" to new user ${user._id}`);
                } else {
                    // Create a brand-new supplier profile from registration data
                    const fullName = `${firstName} ${lastName}`.trim();
                    const supplierCode = `SUP-${Date.now()}`;

                    supplier = await Supplier.create({
                        userId: user._id,
                        name: fullName,
                        email: email.toLowerCase(),
                        contactNumber: phone || '',
                        address: address || '',
                        nicNumber: nic || '',
                        supplierCode,
                        status: 'Active',
                    });
                    console.log(`[register] Created new supplier profile "${fullName}" (${supplierCode}) for user ${user._id}`);
                }
            } catch (supplierErr) {
                // Non-fatal — user account was created, warn but don't block login
                console.error('[register] Failed to auto-create supplier profile:', supplierErr.message);
                supplierWarning = 'Account created, but supplier profile could not be set up. Contact an administrator.';
            }
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: supplierWarning || 'User registered successfully',
            supplierWarning: supplierWarning || null,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    nic: user.nic,
                    isActive: user.isActive
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Create a staff account (owner only)
// @route   POST /api/auth/staff
// @access  Private (Owner only)
exports.createStaff = async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, phone, address, nic } = req.body;

        // Validation
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, role, firstName, lastName'
            });
        }

        // Only staff roles allowed — cannot create another owner via this endpoint
        const allowedStaffRoles = ['factory_manager', 'fertilizer_manager', 'inventory_manager',
                                   'payment_manager', 'transport_manager', 'supplier', 'driver'];
        if (!allowedStaffRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staff role. Cannot create an owner account via this endpoint.'
            });
        }

        // Check if email already taken
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create staff account
        const staff = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone: phone || '',
            address: address || '',
            nic: nic || '',
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: `${role.replace('_', ' ')} account created successfully`,
            data: {
                user: {
                    id: staff._id,
                    email: staff.email,
                    role: staff.role,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    isActive: staff.isActive
                }
            }
        });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating staff account',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    nic: user.nic,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    factoryName: user.factoryName || ''
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    nic: user.nic,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, address, nic, profileImage } = req.body;

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (nic !== undefined) user.nic = nic;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    nic: user.nic,
                    profileImage: user.profileImage,
                    isActive: user.isActive
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
