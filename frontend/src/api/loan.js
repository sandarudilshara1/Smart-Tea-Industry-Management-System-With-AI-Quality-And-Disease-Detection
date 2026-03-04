import axios from "./axios";

// Approve loan request by ID
export const approveLoanRequest = async (loanId) => {
	try {
		// Remove duplicate /api if axios already prefixes it
		const response = await axios.put(`/loan-requests/${loanId}/approve`);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};

// Get all loans
export const getAllLoans = async () => {
	try {
		const response = await axios.get(`/loans`);
		return response.data;
	} catch (error) {
		throw error.response?.data || error.message;
	}
};
