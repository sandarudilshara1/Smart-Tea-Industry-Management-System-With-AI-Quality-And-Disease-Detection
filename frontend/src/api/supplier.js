import axios from "./axios";

// Get supplier summary counts for a factory
export const getSupplierCounts = async () => {
  const res = await axios.get(`/suppliers/count`);
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
export const getApprovedSuppliers = async (params = {}) => {
  const res = await axios.get(`/suppliers/active`, {
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
    `/supplier-requests/status/${status}`,
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
export const getRoutesDetails = async (factoryId) => {
  // This helper is used for dropdowns (routes list), not a single route by id.
  // Some roles do not have factoryId populated in the auth payload; treat it as optional.
  const params = {
    status: "Active",
    page: 0,
    limit: 1000,
  };
  if (factoryId) params.factoryId = factoryId;

  const res = await axios.get(`/routes`, { params });

  const rawRoutes =
    (Array.isArray(res.data?.content) && res.data.content) ||
    (Array.isArray(res.data?.data?.routes) && res.data.data.routes) ||
    (Array.isArray(res.data?.data) && res.data.data) ||
    [];

  return rawRoutes.map((r) => ({
    routeId: r._id || r.routeId || r.id,
    name: r.routeName || r.name,
    routeCode: r.routeNumber || r.routeCode,
  }));
};
