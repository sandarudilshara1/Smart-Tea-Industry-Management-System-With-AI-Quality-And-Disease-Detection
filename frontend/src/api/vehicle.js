import axios from './axios';

// Get all vehicles
export const getAllVehicles = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

        const response = await axios.get(`/vehicles?${params.toString()}`);
        return response.data.data;
    } catch (error) {
        console.error('Get all vehicles error:', error);
        throw error.response?.data || error;
    }
};

// Get vehicle by ID
export const getVehicleById = async (id) => {
    try {
        const response = await axios.get(`/vehicles/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Get vehicle by ID error:', error);
        throw error.response?.data || error;
    }
};

// Create new vehicle
export const createVehicle = async (vehicleData) => {
    try {
        console.log('API: Creating vehicle with data:', vehicleData);
        console.log('API: POST to /vehicles');
        const response = await axios.post('/vehicles', vehicleData);
        console.log('API: Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create vehicle error:', error);
        console.error('Error response:', error.response);
        throw error.response?.data || error;
    }
};

// Update vehicle
export const updateVehicle = async (id, vehicleData) => {
    try {
        const response = await axios.put(`/vehicles/${id}`, vehicleData);
        return response.data;
    } catch (error) {
        console.error('Update vehicle error:', error);
        throw error.response?.data || error;
    }
};

// Delete vehicle
export const deleteVehicle = async (id) => {
    try {
        const response = await axios.delete(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete vehicle error:', error);
        throw error.response?.data || error;
    }
};

// Update vehicle status
export const updateVehicleStatus = async (id, status) => {
    try {
        const response = await axios.patch(`/vehicles/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Update vehicle status error:', error);
        throw error.response?.data || error;
    }
};

// Assign driver to vehicle
export const assignDriver = async (vehicleId, driverId, driverName) => {
    try {
        const response = await axios.patch(`/vehicles/${vehicleId}/assign-driver`, {
            driverId,
            driverName
        });
        return response.data;
    } catch (error) {
        console.error('Assign driver error:', error);
        throw error.response?.data || error;
    }
};

// Unassign driver from vehicle
export const unassignDriver = async (vehicleId) => {
    try {
        const response = await axios.patch(`/vehicles/${vehicleId}/unassign-driver`);
        return response.data;
    } catch (error) {
        console.error('Unassign driver error:', error);
        throw error.response?.data || error;
    }
};

// Get vehicle statistics
export const getVehicleStats = async () => {
    try {
        const response = await axios.get('/vehicles/stats/summary');
        return response.data.data;
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        throw error.response?.data || error;
    }
};
