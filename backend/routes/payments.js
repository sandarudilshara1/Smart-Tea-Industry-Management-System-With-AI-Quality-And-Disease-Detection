const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');

const PAYMENT_WRITE_ROLES = ['owner', 'factory_manager', 'payment_manager'];

// Monthly payment routes
router.post('/monthly/calculate', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.calculateMonthlyPayments);
router.get('/monthly/pending-approval', auth, paymentController.getMonthlyPaymentsForApproval);
router.post('/monthly/approve', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.approveMonthlyPayments);

// Ad-hoc payment routes
router.post('/adhoc', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.createAdhocPayment);
router.get('/adhoc/pending', auth, paymentController.getPendingAdhocPayments);
router.post('/adhoc/:paymentId/approve', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.approveAdhocPayment);

// Bank payment routes
router.get('/bank/queue', auth, paymentController.getBankPaymentsQueue);
router.post('/bank/generate-csv', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.generateBankCsv);
router.get('/bank/csv/:batchId/download', auth, paymentController.downloadBankCsv);
router.get('/bank/csv/history', auth, paymentController.getBankCsvHistory);

// Cash payment routes
router.get('/cash/queue', auth, paymentController.getCashPaymentsQueue);
router.get('/cash/route/:routeId', auth, paymentController.getCashPaymentsByRoute);
router.post('/cash/disburse', auth, authorize(...PAYMENT_WRITE_ROLES), paymentController.disburseCash);
router.get('/cash/history', auth, paymentController.getCashCollectionHistory);

// General payment routes
router.get('/dashboard', auth, paymentController.getDashboardStats);
router.get('/summary', auth, paymentController.getPaymentSummary);
router.get('/owner-overview', auth, authorize('owner'), paymentController.getOwnerPaymentOverview);
router.get('/owner-route-summary', auth, authorize('owner'), paymentController.getOwnerRoutePaymentSummary);
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/supplier/:supplierId', auth, paymentController.getPaymentsBySupplier);
router.get('/route/:routeId', auth, paymentController.getPaymentsByRoute);
router.get('/:paymentId', auth, paymentController.getPaymentById);

module.exports = router;
