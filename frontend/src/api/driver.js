import axios from './axios';

/**
 * Driver API functions
 */

// Create a new driver
export const createDriver = async (driverData) => {
    try {
        const response = await axios.post('/drivers', driverData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create driver' };
    }
};

// Get all drivers
export const getAllDrivers = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.factoryId) params.append('factoryId', filters.factoryId);
        
        const queryString = params.toString();
        const url = queryString ? `/drivers?${queryString}` : '/drivers';
        const response = await axios.get(url);
        return response.data; // Return full response with success, count, data
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch drivers' };
    }
};

// Get single driver by ID
export const getDriverById = async (driverId) => {
    try {
        const response = await axios.get(`/drivers/${driverId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch driver' };
    }
};

// Update driver
export const updateDriver = async (driverId, driverData) => {
    try {
        const response = await axios.put(`/drivers/${driverId}`, driverData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update driver' };
    }
};

// Delete driver (soft delete)
export const deleteDriver = async (driverId) => {
    try {
        const response = await axios.delete(`/drivers/${driverId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete driver' };
    }
};

// Assign route to driver
export const assignRoute = async (driverId, routeData) => {
    try {
        const response = await axios.post(`/drivers/${driverId}/assign-route`, routeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to assign route' };
    }
};

// Unassign route from driver
export const unassignRoute = async (driverId, routeId) => {
    try {
        const response = await axios.delete(`/drivers/${driverId}/assign-route/${routeId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to unassign route' };
    }
};

// Get available drivers
export const getAvailableDrivers = async () => {
    try {
        const response = await axios.get('/drivers?status=Available');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch available drivers' };
    }
};
