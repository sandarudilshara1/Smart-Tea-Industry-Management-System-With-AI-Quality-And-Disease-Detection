import axios from "./axios";

// Get advances for a factory by status with pagination and filtering
export const getAdvancesByStatus = async (status, params = {}) => {
  const res = await axios.get(`/advances/status`, {
    params: { status, ...params },
  });
  return res.data;
};

// Get advance details by ID
export const getAdvanceDetails = async (advanceId) => {
  const res = await axios.get(`/advances/${advanceId}`);
  return res.data;
};

// Approve an advance request
export const approveAdvance = async (advanceId, approvalData) => {
  const res = await axios.put(`/advances/${advanceId}/approve`, approvalData);
  return res.data;
};

// Reject an advance request
export const rejectAdvance = async (advanceId, rejectionData) => {
  const res = await axios.put(`/advances/${advanceId}/reject`, rejectionData);
  return res.data;
};

// Get advance status counts for a factory
export const getAdvanceStatusCounts = async (params = {}) => {
  const res = await axios.get(`/advances/status-counts`, {
    params,
  });
  return res.data;
};

// ===== PAYMENT APIs =====

// 1. Calculate Monthly Payments
export const calculateMonthlyPayments = async (calculationData) => {
  const res = await axios.post("/payments/monthly/calculate", calculationData);
  return res.data;
};

// 2. Get Monthly Payments for Approval
export const getMonthlyPaymentsForApproval = async (params) => {
  const res = await axios.get("/payments/monthly/pending-approval", { params });
  return res.data;
};

// 3. Approve Monthly Payments
export const approveMonthlyPayments = async (approvalData) => {
  const res = await axios.post("/payments/monthly/approve", approvalData);
  return res.data;
};

// 4. Create Ad-hoc Payment
export const createAdhocPayment = async (paymentData) => {
  const res = await axios.post("/payments/adhoc", paymentData);
  return res.data;
};

// 5. Get Pending Ad-hoc Payments
export const getPendingAdhocPayments = async (params) => {
  const res = await axios.get("/payments/adhoc/pending", { params });
  return res.data;
};

// 6. Approve Ad-hoc Payment
export const approveAdhocPayment = async (paymentId, approvalData) => {
  const res = await axios.post(
    `/payments/adhoc/${paymentId}/approve`,
    approvalData
  );
  return res.data;
};

// 7. Get Bank Payments Queue
export const getBankPaymentsQueue = async (params) => {
  const res = await axios.get("/payments/bank/queue", { params });
  return res.data;
};

// 8. Generate Bank CSV
export const generateBankCsv = async (csvData) => {
  const res = await axios.post("/payments/bank/generate-csv", csvData);
  return res.data;
};

// 9. Download Bank CSV
export const downloadBankCsv = async (batchId) => {
  const res = await axios.get(`/payments/bank/csv/${batchId}/download`, {
    responseType: "blob",
  });
  return res.data;
};

// 10. Get Bank CSV History
export const getBankCsvHistory = async (params) => {
  const res = await axios.get("/payments/bank/csv/history", { params });
  return res.data;
};

// 11. Get Cash Payments Queue
export const getCashPaymentsQueue = async (params) => {
  const res = await axios.get("/payments/cash/queue", { params });
  // Backend returns { success, content: [...] } - return content array or empty object
  return res.data?.content || res.data || {};
};

// 12. Get Cash Payments by Route
export const getCashPaymentsByRoute = async (routeId) => {
  const res = await axios.get(`/payments/cash/route/${routeId}`);
  return res.data;
};

// 13. Disburse Cash
export const disburseCash = async (disbursementData) => {
  const res = await axios.post("/payments/cash/disburse", disbursementData);
  return res.data;
};

// 14. Get Cash Collection History
export const getCashCollectionHistory = async (params) => {
  const res = await axios.get("/payments/cash/history", { params });
  return res.data;
};

// 15. Get Payment by ID
export const getPaymentById = async (paymentId) => {
  const res = await axios.get(`/payments/${paymentId}`);
  return res.data;
};

// 16. Get Payments by Supplier
export const getPaymentsBySupplier = async (supplierId, params) => {
  const res = await axios.get(`/payments/supplier/${supplierId}`, { params });
  return res.data;
};

// 17. Get Payments by Route
export const getPaymentsByRoute = async (routeId, params) => {
  const res = await axios.get(`/payments/route/${routeId}`, { params });
  return res.data;
};

// 18. Get Payment History
export const getPaymentHistory = async (params) => {
  const res = await axios.get("/payments/history", { params });
  return res.data;
};

// 19. Get Payment Summary
export const getPaymentSummary = async (params) => {
  const res = await axios.get("/payments/summary", { params });
  return res.data;
};

// 20. Get Dashboard Statistics
export const getDashboardStatistics = async (params) => {
  const res = await axios.get("/payments/dashboard", { params });
  // Backend returns { success, data: {...stats} }
  return res.data?.data || res.data;
};

// 21. Update Payment Status
export const updatePaymentStatus = async (paymentId, statusData) => {
  const res = await axios.put(`/payments/${paymentId}/status`, statusData);
  return res.data;
};

// 22. Cancel Payment
export const cancelPayment = async (paymentId, cancelData) => {
  const res = await axios.post(`/payments/${paymentId}/cancel`, cancelData);
  return res.data;
};

// 23. Get Supplier Deductions
export const getSupplierDeductions = async (supplierId) => {
  const res = await axios.get(`/payments/supplier/${supplierId}/deductions`);
  return res.data;
};

// 24. Get Supplier Deductions Total
export const getSupplierDeductionsTotal = async (supplierId) => {
  const res = await axios.get(
    `/payments/supplier/${supplierId}/deductions/total`
  );
  return res.data;
};

// 25. Get Loan Statistics
export const getLoanStats = async (month, year) => {
  const res = await axios.get(`/loans/stats`, {
    params: { month, year }
  });
  return res.data;
};

// 26. Get Filtered Loans by Status
export const getFilteredLoans = async (status, month, year) => {
  const res = await axios.get(`/loans/filter`, {
    params: { status, month, year }
  });
  return res.data;
};
