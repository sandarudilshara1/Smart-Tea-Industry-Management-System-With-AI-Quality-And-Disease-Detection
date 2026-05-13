import axios from "../axios";

// API functions for inventory manager

// Fetch dashboard summary for Inventory Manager
export const getInventoryManagerDashboardSummary = async (params) => {
  const res = await axios.get(
    `/inventory-process/dashboard-summary`,
    { params }
  );
  return res.data;
};

// Fetch today's trips for a factory with pagination
export const getTodayTrips = async (params) => {
  const res = await axios.get(
    `/inventory-process/factories/trips/today`,
    { params }
  );
  return res.data;
};

export const getInventoryManagersByFactory = async (factoryId) => {
  const res = await axios.get(`/inventory-process/inventory-managers`, {
    params: { factoryId }
  });
  return res.data;
};

// Get paginated bag weights
export const getBagWeights = async (params) => {
  const res = await axios.get(`/inventory-process/bagweights`, {
    params,
  });
  return res.data;
};

// Get paginated fertilizer history
export const getFertilizerHistory = async (params) => {
  const res = await axios.get(`/inventory-process/fertilizer-history`, {
    params,
  });
  return res.data;
};
