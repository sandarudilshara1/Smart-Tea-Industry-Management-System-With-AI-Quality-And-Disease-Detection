const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    updateProfile, 
    changePassword,
    createStaff
} = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

// Owner-only: create a staff account
router.post('/staff', auth, authorize('owner'), createStaff);

module.exports = router;
