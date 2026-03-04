// File: src/api/fertilizerManager.js
// Get all fertilizer stocks
export async function getAllFertilizerStocks() {
  const { data } = await axios.get("/fertilizer-stocks");
  return data;
}

// Create fertilizer stock (connects to backend DTO)
export async function createFertilizerStock(payload) {
  const { data } = await axios.post("/fertilizer-stocks", payload);
  return data;
}

// Axios API client for fertilizer requests aligned with backend controller
// Uses shared axios instance that already sets Authorization header
import axios from "./axios";

const base = "/fertilizer-requests"; // Matches the @RequestMapping in the backend controller

// Create single request
export async function createFertilizerRequest(payload) {
  const { data } = await axios.post(base, payload);
  return data;
}

// Create batch requests
export async function createFertilizerRequestsBatch(payload) {
  const { data } = await axios.post(`${base}/batch`, payload);
  return data;
}

// Get all requests with optional status filter
export async function getAllFertilizerRequests(status) {
  const url = status ? `${base}?status=${encodeURIComponent(status)}` : base;
  const { data } = await axios.get(url);
  return data;
}

// Get request by id
export async function getFertilizerRequestById(id) {
  const { data } = await axios.get(`${base}/${id}`);
  return data;
}

// Get requests by user
export async function getFertilizerRequestsByUser(userId) {
  const { data } = await axios.get(`${base}/user/${userId}`);
  return data;
}

// Get requests by user and status
export async function getFertilizerRequestsByUserAndStatus(userId, status) {
  const { data } = await axios.get(`${base}/user/${userId}/status/${status}`);
  return data;
}

// Update request status
export async function updateFertilizerRequestStatus(id, payload) {
  const { data } = await axios.patch(`${base}/${id}/status`, payload);
  return data;
}

// Approve request
export async function approveFertilizerRequest(id) {
  const { data } = await axios.patch(`${base}/${id}/approve`);
  return data;
}

// Reject request with reason
export async function rejectFertilizerRequest(id, rejectReason) {
  const { data } = await axios.patch(`${base}/${id}/reject`, { rejectReason });
  return data;
}

// Supplier Fertilizer Requests API
const supplierBase = '/supplier-fertilizer-requests'; // FIXED: removed extra /api

// Fertilizer Stock Requests API
const fertilizerStockRequestBase = '/fertilizer-requests/fertilizer-stock-requests';

// Create fertilizer stock request
export async function createFertilizerStockRequest(payload) {
  const { data } = await axios.post(fertilizerStockRequestBase, payload);
  return data;
}

// Get all fertilizer stock requests
export async function getAllFertilizerStockRequests() {
  const { data } = await axios.get(fertilizerStockRequestBase);
  return data;
}

// Create supplier fertilizer request
export async function createSupplierFertilizerRequest(payload) {
  const { data } = await axios.post(supplierBase, payload);
  return data;
}

// Get all supplier fertilizer requests
export async function getAllSupplierFertilizerRequests() {
  const { data } = await axios.get(supplierBase);
  return data;
}