import axios from "./axios";

// Inventory Manager
export const createLeafSupplyRequest = async (payload) => {
  const res = await axios.post("/leaf-supply-requests", payload);
  return res.data;
};

export const getMyLeafSupplyRequests = async (params = {}) => {
  const res = await axios.get("/leaf-supply-requests/mine", { params });
  return res.data;
};

export const receiveLeafSupplyRequest = async (id, payload) => {
  const res = await axios.patch(`/leaf-supply-requests/${id}/receive`, payload);
  return res.data;
};

// Supplier
export const getSupplierInboxLeafSupplyRequests = async (params = {}) => {
  const res = await axios.get("/leaf-supply-requests/inbox", { params });
  return res.data;
};

export const confirmLeafSupplyRequest = async (id) => {
  const res = await axios.patch(`/leaf-supply-requests/${id}/confirm`);
  return res.data;
};

export const rejectLeafSupplyRequest = async (id, reason) => {
  const res = await axios.patch(`/leaf-supply-requests/${id}/reject`, { reason });
  return res.data;
};
