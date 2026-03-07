const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Monthly payment routes
router.post('/monthly/calculate', auth, paymentController.calculateMonthlyPayments);
router.get('/monthly/pending-approval', auth, paymentController.getMonthlyPaymentsForApproval);
router.post('/monthly/approve', auth, paymentController.approveMonthlyPayments);

// Ad-hoc payment routes
router.post('/adhoc', auth, paymentController.createAdhocPayment);
router.get('/adhoc/pending', auth, paymentController.getPendingAdhocPayments);
router.post('/adhoc/:paymentId/approve', auth, paymentController.approveAdhocPayment);

// Bank payment routes
router.get('/bank/queue', auth, paymentController.getBankPaymentsQueue);
router.post('/bank/generate-csv', auth, paymentController.generateBankCsv);
router.get('/bank/csv/:batchId/download', auth, paymentController.downloadBankCsv);
router.get('/bank/csv/history', auth, paymentController.getBankCsvHistory);

// Cash payment routes
router.get('/cash/queue', auth, paymentController.getCashPaymentsQueue);
router.get('/cash/route/:routeId', auth, paymentController.getCashPaymentsByRoute);
router.post('/cash/disburse', auth, paymentController.disburseCash);
router.get('/cash/history', auth, paymentController.getCashCollectionHistory);

// General payment routes
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/:paymentId', auth, paymentController.getPaymentById);
router.get('/supplier/:supplierId', auth, paymentController.getPaymentsBySupplier);
router.get('/route/:routeId', auth, paymentController.getPaymentsByRoute);

module.exports = router;
