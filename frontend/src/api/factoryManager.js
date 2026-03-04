
import axios from "./axios";

const TEA_RATE_API_URL = "/tea_rates";
const LOAN_REQUEST_API_URL = "/loan-requests";

// Get tea rate records for a user
export const fetchTeaRateRecords = async (userId) => {
  try {
    const response = await axios.get(`${TEA_RATE_API_URL}?userId=${userId}`);
    if (response.status === 200) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching tea rate records:", error);
    return [];
  }
};

// Get all loan requests
export const fetchLoanRequests = async () => {
  try {
    const response = await axios.get(LOAN_REQUEST_API_URL);
    if (response.status === 200) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching loan requests:", error);
    return [];
  }
};

// Create a new loan request
export const createLoanRequest = async (payload) => {
  try {
    const response = await axios.post(LOAN_REQUEST_API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating loan request:", error);
    throw error;
  }
};

// Submit tea rate adjustment
export const submitTeaRate = async (payload) => {
  try {
    const res = await axios.post(TEA_RATE_API_URL, payload);
    return res;
  } catch (err) {
    console.error("Error submitting tea rate:", err);
    throw err;
  }
};
