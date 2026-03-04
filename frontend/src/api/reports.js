import api from './axios';

// Get business overview statistics
export const getOverview = async () => {
    try {
        const response = await api.get('/reports/overview');
        return response.data;
    } catch (error) {
        console.error('Get overview error:', error);
        throw error;
    }
};

// Get production statistics
export const getProduction = async () => {
    try {
        const response = await api.get('/reports/production');
        return response.data;
    } catch (error) {
        console.error('Get production error:', error);
        throw error;
    }
};

// Get financial statistics
export const getFinancial = async () => {
    try {
        const response = await api.get('/reports/financial');
        return response.data;
    } catch (error) {
        console.error('Get financial error:', error);
        throw error;
    }
};

// Get quality assessment statistics
export const getQuality = async () => {
    try {
        const response = await api.get('/reports/quality');
        return response.data;
    } catch (error) {
        console.error('Get quality error:', error);
        throw error;
    }
};

// Get disease monitoring statistics
export const getDiseases = async () => {
    try {
        const response = await api.get('/reports/diseases');
        return response.data;
    } catch (error) {
        console.error('Get diseases error:', error);
        throw error;
    }
};

// Get employee statistics
export const getEmployeeStats = async () => {
    try {
        const response = await api.get('/reports/employees');
        return response.data;
    } catch (error) {
        console.error('Get employee stats error:', error);
        throw error;
    }
};

// Export report
export const exportReport = async (reportType, format) => {
    try {
        const response = await api.post('/reports/export', { reportType, format });
        return response.data;
    } catch (error) {
        console.error('Export report error:', error);
        throw error;
    }
};
