import axios from "../axios";

export const getFertilizerInventorySummary = async () => {
    const res = await axios.get("/fertilizer-inventory/summary");
    return res.data;
};

export const receiveFertilizerStock = async (payload) => {
    const res = await axios.post("/fertilizer-inventory/receive", payload);
    return res.data;
};

export const recordFertilizerUsage = async (payload) => {
    const res = await axios.post("/fertilizer-inventory/use", payload);
    return res.data;
};

export const getFertilizerInventoryTransactions = async (params = {}) => {
    const res = await axios.get("/fertilizer-inventory/transactions", { params });
    return res.data;
};

export const requestFertilizerStock = async (payload) => {
    const res = await axios.post("/fertilizer-inventory/request", payload);
    return res.data;
};

export const getFertilizerRequests = async (params = {}) => {
    const res = await axios.get("/fertilizer-inventory/requests", { params });
    return res.data;
};

export const updateFertilizerRequestStatus = async (id, status) => {
    const res = await axios.put(`/fertilizer-inventory/requests/${id}/status`, { status });
    return res.data;
};
