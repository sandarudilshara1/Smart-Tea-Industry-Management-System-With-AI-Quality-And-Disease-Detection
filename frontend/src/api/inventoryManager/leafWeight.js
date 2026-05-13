import axios from "../axios";

// Get trip details by tripId
export const getTripDetails = async (tripId) => {
  const res = await axios.get(`/trips/${tripId}`);
  return res.data;
};

// Get weighing session for a trip
export const getWeighingSessionByTrip = async (tripId) => {
  const res = await axios.get(`/weighing-sessions/trip/${tripId}`);
  return res.data;
};

// Get pending bags for a trip (arrived view)
export const getPendingBagsForTrip = async (tripId) => {
  const res = await axios.get(`/inventory-process/trip/${tripId}/bags/pending`);
  return res.data;
};

// Get paginated bag weights by sessionId (completed view)
// Supports pagination, search, and status param (should be 'weighed')
// GET /bagweights/session/{sessionId}/paged?page=0&search=foo&status=weighed
export const getBagWeightsBySession = async (
  sessionId,
  status,
  page = 0,
  search = ""
) => {
  const params = { page, status };
  if (search) params.search = search;
  const res = await axios.get(`/bagweights/session/${sessionId}/paged`, {
    params,
  });
  return res.data;
};

// Create a new weighing session
export const createWeighingSession = async (payload) => {
  // payload should contain { userId, tripId }
  const res = await axios.post(`/weighing-sessions`, payload);
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

// Get trip status counts for a factory for today
export const getTripStatusCounts = async () => {
  const res = await axios.get(
    `/trips/status-counts/today`
  );
  return res.data;
};

// Get trips for a factory filtered by status (supports pagination and search)
// Example: /api/trips/factory/{factoryId}/status/{status}/today?page=0&size=10&search=foo
export const getTripsByFactoryAndStatus = async (
  factoryId,
  status,
  page = 0,
  search = ""
) => {
  const params = { page };
  if (search) params.search = search;
  const res = await axios.get(
    `/trips/status/${status}/today`,
    {
      params,
    }
  );
  return res.data;
};

// Get trip summary for cards in 'arrived' view
// GET /inventory-process/trip/{tripId}/summary
export const getTripSummary = async (tripId) => {
  const res = await axios.get(`/inventory-process/trip/${tripId}/summary`);
  return res.data;
};

// Get paginated bags for a trip (arrived view)
// GET /trip-bags/trip/{tripId}/today?page=0&search=bagNo
export const getPaginatedBagsForTrip = async (
  tripId,
  page = 0,
  search = ""
) => {
  const params = { page };
  if (search) params.search = search;
  const res = await axios.get(`/trip-bags/trip/${tripId}/today`, { params });
  return res.data;
};

// Get trip weighing summary for 'completed' view
// GET /inventory-process/trip/{tripId}/weighing-summary?status={status}
export const getTripWeighingSummary = async (tripId, status = "weighed") => {
  const res = await axios.get(
    `/inventory-process/trip/${tripId}/weighing-summary`,
    { params: { status } }
  );
  return res.data;
};

// Get supplier info by supplyRequestId
// GET /trip-bags/supplier-info/by-supply-request/{supplyRequestId}
export const getSupplierInfoBySupplyRequest = async (supplyRequestId) => {
  const res = await axios.get(
    `/trip-bags/supplier-info/by-supply-request/${supplyRequestId}`
  );
  return res.data;
};

// Get bag details by supplyRequestId and status
// GET /trip-bags/by-supply-request/{supplyRequestId}/details?status={status}
export const getBagDetailsBySupplyRequest = async (
  supplyRequestId,
  status = "pending"
) => {
  const res = await axios.get(
    `/trip-bags/by-supply-request/${supplyRequestId}/details`,
    {
      params: { status },
    }
  );
  return res.data;
};
