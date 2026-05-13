import axios from './axios';

export const reportEmergency = async ({ issueType, severity, description, locationText }) => {
    try {
        const response = await axios.post('/emergencies/report', {
            issueType,
            severity,
            description,
            locationText,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to report emergency' };
    }
};

export const getEmergencies = async (params = {}) => {
    try {
        const response = await axios.get('/emergencies', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch emergencies' };
    }
};

export const getMyEmergencies = async () => {
    try {
        const response = await axios.get('/emergencies/my');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch my emergencies' };
    }
};

export const assignEmergencyReplacement = async (emergencyId, { replacementVehicleNumber, assignmentNote }) => {
    try {
        const response = await axios.patch(`/emergencies/${emergencyId}/assign-replacement`, {
            replacementVehicleNumber,
            assignmentNote,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to assign replacement' };
    }
};

export const updateEmergencyStatus = async (emergencyId, status) => {
    try {
        const response = await axios.patch(`/emergencies/${emergencyId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update emergency status' };
    }
};
