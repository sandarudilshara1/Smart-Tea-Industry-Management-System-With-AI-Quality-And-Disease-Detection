import axios from "./axios";

// Get supplier summary counts for a factory
export const getSupplierCounts = async (factoryId) => {
  const res = await axios.get(`/suppliers/count/${factoryId}`);
  return res.data;
};

// Approve supplier request
export const approveSupplierRequest = async (id, routeId, initialBagCount) => {
  const body = {
    routeId: Number(routeId),
    initialBagCount: Number(initialBagCount),
  };
  return axios.post(`/supplier-requests/${id}/approve`, body);
};

// Reject supplier request
export const rejectSupplierRequest = async (id, reason) => {
  return axios.post(`/supplier-requests/${id}/reject`, { reason });
};

// Get approved suppliers for a factory
export const getApprovedSuppliers = async (factoryId, params = {}) => {
  const res = await axios.get(`/suppliers/active/factory/${factoryId}`, {
    params,
  });
  return res.data;
};

// Get supplier requests by status (pending/rejected) for a factory
export const getSupplierRequestsByStatus = async (
  factoryId,
  status,
  params = {}
) => {
  const res = await axios.get(
    `/supplier-requests/factory/${factoryId}/status/${status}`,
    { params }
  );
  return res.data;
};

// Get supplier details (approved)
export const getApprovedSupplierDetails = async (id) => {
  const res = await axios.get(`/suppliers/details/${id}`);
  return res.data;
};

// Get supplier request details (pending/rejected)
export const getSupplierRequestDetails = async (id) => {
  const res = await axios.get(`/supplier-requests/details/${id}`);
  return res.data;
};

// Get Route details
export const getRoutesDetails = async (id) => {
  const res = await axios.get(`/routes/factory/${id}`);
  return res.data;
};
