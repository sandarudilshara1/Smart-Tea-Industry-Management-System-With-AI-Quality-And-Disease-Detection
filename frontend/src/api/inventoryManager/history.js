import axios from "../axios";

// API functions for inventory manager

// Fetch dashboard summary for Inventory Manager
export const getInventoryManagerDashboardSummary = async (factoryId) => {
  const res = await axios.get(
    `/inventory-process/${factoryId}/dashboard-summary`
  );
  return res.data;
};

// Fetch today's trips for a factory with pagination
export const getTodayTrips = async (factoryId, params = {}) => {
  const res = await axios.get(
    `/inventory-process/factories/${factoryId}/trips/today`,
    { params }
  );
  return res.data;
};

export const getInventoryManagersByFactory = async (factoryId) => {
  const res = await axios.get(`/users/inventory-managers/${factoryId}`);
  return res.data;
};

// Get paginated bag weights
export const getBagWeights = async (factoryId, params) => {
  const res = await axios.get(`/inventory-process/${factoryId}/bagweights`, {
    params,
  });
  return res.data;
};
