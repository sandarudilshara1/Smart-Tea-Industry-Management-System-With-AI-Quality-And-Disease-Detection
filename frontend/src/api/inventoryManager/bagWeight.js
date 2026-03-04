import axios from "../axios";

// Get weighed bags for a trip (weighed view)
export const getWeighedBagsForTrip = async (tripId) => {
  const res = await axios.get(`/inventory-process/trip/${tripId}/bags/weighed`);
  return res.data;
};

// Get bag weights summary by sessionId (completed view)
export const getBagWeightsBySession = async (sessionId) => {
  const res = await axios.get(`/bagweights/session/${sessionId}`);
  return res.data;
};

// Get bagWeightId for a supply request (returns id or empty)
export const getBagWeightIdBySupplyRequest = async (supplyRequestId) => {
  const res = await axios.get(
    `/inventory-process/supply-request/${supplyRequestId}/bagweight-id`,
    { responseType: "text" }
  );
  // server may return text or json; return parsed data if possible
  try {
    return res.data ? JSON.parse(res.data) : null;
  } catch {
    return res.data || null;
  }
};

// Update empty bag tare weight by bagWeightId (called from empty bag supplier)
export const updateEmptyBagTare = async (bagWeightId, payload) => {
  const res = await axios.put(
    `/inventory-process/empty-bag/${bagWeightId}`,
    payload
  );
  return res.data;
};

// Create bag weights (POST)
export const createBagWeights = async (payload) => {
  const res = await axios.post(`/bagweights`, payload);
  return res.data;
};

// Update bag weights (PUT) by bagWeightId
export const updateBagWeights = async (bagWeightId, payload) => {
  const res = await axios.put(`/bagweights/${bagWeightId}`, payload);
  return res.data;
};

// Get weighed bags for a trip (paginated & searchable)
export const getWeighedBagsForTripPaginated = async (
  tripId,
  { page = 0, size = 15, search = "" } = {}
) => {
  const params = { page, size };
  if (search) params.search = search;
  const res = await axios.get(`/trip-bags/trip/${tripId}/weighed`, { params });
  return res.data;
};
