const FertilizerCompany = require('../models/FertilizerCompany');

// @desc    Get all fertilizer companies
// @route   GET /api/fertilizer-companies
// @access  Private
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await FertilizerCompany.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select('-__v');

        // Transform to match frontend expected format
        const formattedCompanies = companies.map(company => ({
            id: company._id.toString(),
            name: company.name,
            address: company.address,
            contactPerson: company.contactPerson,
            contactNumber: company.contactNumber,
            email: company.email,
            categories: company.categories
        }));

        res.status(200).json(formattedCompanies);
    } catch (error) {
        console.error('Get fertilizer companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching fertilizer companies',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get fertilizer company dropdown (id + name only)
// @route   GET /api/fertilizer-companies/dropdown
// @access  Private
exports.getCompanyDropdown = async (req, res) => {
    try {
        const companies = await FertilizerCompany.find({ isActive: true })
            .select('_id name')
            .sort({ name: 1 });

        const dropdown = companies.map(company => ({
            id: company._id.toString(),
            name: company.name
        }));

        res.status(200).json(dropdown);
    } catch (error) {
        console.error('Get company dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching company dropdown',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get categories for a specific company
// @route   GET /api/fertilizer-companies/:id/categories
// @access  Private
exports.getCompanyCategories = async (req, res) => {
    try {
        const company = await FertilizerCompany.findById(req.params.id).select('categories');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Transform categories to dropdown format
        const categories = company.categories.map((cat, index) => ({
            id: index.toString(),
            name: cat
        }));

        res.status(200).json(categories);
    } catch (error) {
        console.error('Get company categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching company categories',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Create new fertilizer company
// @route   POST /api/fertilizer-companies
// @access  Private (Owner only)
exports.createCompany = async (req, res) => {
        console.log('Received create company request:', req.body);
        
    try {
        const {
            name,
            address,
            contactPerson,
            contactNumber,
            email,
            categories
        } = req.body;

        // Validation
        if (!name || !address || !contactPerson || !contactNumber || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one fertilizer category'
            });
        }

        // Check if company with email already exists
        const existingCompany = await FertilizerCompany.findOne({ email: email.toLowerCase() });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this email already exists'
            });
        }

        // Create company
        const company = await FertilizerCompany.create({
            name,
            address,
            contactPerson,
            contactNumber,
            email: email.toLowerCase(),
            categories,
            createdBy: req.user.userId,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            id: company._id.toString(),
            name: company.name,
            address: company.address,
            contactPerson: company.contactPerson,
            contactNumber: company.contactNumber,
            email: company.email,
            categories: company.categories
        });
    } catch (error) {
        console.error('Create fertilizer company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating fertilizer company',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Update fertilizer company
// @route   PUT /api/fertilizer-companies/:id
// @access  Private (Owner only)
exports.updateCompany = async (req, res) => {
    try {
        const {
            name,
            address,
            contactPerson,
            contactNumber,
            email,
            categories
        } = req.body;

        let company = await FertilizerCompany.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if email is being changed and if new email already exists
        if (email && email.toLowerCase() !== company.email) {
            const existingCompany = await FertilizerCompany.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingCompany) {
                return res.status(400).json({
                    success: false,
                    message: 'Company with this email already exists'
                });
            }
        }

        // Update fields
        company.name = name || company.name;
        company.address = address || company.address;
        company.contactPerson = contactPerson || company.contactPerson;
        company.contactNumber = contactNumber || company.contactNumber;
        company.email = email ? email.toLowerCase() : company.email;
        company.categories = categories || company.categories;

        await company.save();

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            id: company._id.toString(),
            name: company.name,
            address: company.address,
            contactPerson: company.contactPerson,
            contactNumber: company.contactNumber,
            email: company.email,
            categories: company.categories
        });
    } catch (error) {
        console.error('Update fertilizer company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating fertilizer company',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Delete fertilizer company (soft delete)
// @route   DELETE /api/fertilizer-companies/:id
// @access  Private (Owner only)
exports.deleteCompany = async (req, res) => {
    try {
        const company = await FertilizerCompany.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Soft delete
        company.isActive = false;
        await company.save();

        res.status(200).json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('Delete fertilizer company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting fertilizer company',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
