const express = require('express');
const router = express.Router();
const LoanRate = require('../models/LoanRate');
const auth = require('../middleware/auth'); // If needed

// Get all loan rates
router.get('/', async (req, res) => {
    try {
        const rates = await LoanRate.find().sort({ effectiveDate: -1 });
        // Format to match frontend expectations (YYYY-MM-DD string)
        const formattedRates = rates.map(r => ({
            id: r._id,
            rate: r.rate,
            effectiveDate: r.effectiveDate.toISOString().split('T')[0]
        }));
        res.json(formattedRates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new loan rate
router.post('/', async (req, res) => {
    try {
        const { rate, effectiveDate } = req.body;
        const newRate = new LoanRate({
            rate,
            effectiveDate: effectiveDate || Date.now()
        });
        await newRate.save();
        res.status(201).json(newRate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
