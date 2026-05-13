import axios from './axios';

// API functions for transport manager
export const getTransportDashboard = async () => {
  try {
    const response = await axios.get('/transport-manager/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load transport dashboard' };
  }
};
