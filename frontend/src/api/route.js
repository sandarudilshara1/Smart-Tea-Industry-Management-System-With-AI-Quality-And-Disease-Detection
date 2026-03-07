import axios from './axios';

/**
 * Route API functions
 */

// Get all routes for a factory
export const getAllRoutes = async (factoryId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.page !== undefined) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        
        const queryString = params.toString();
        const url = queryString 
            ? `/routes/factory/${factoryId}?${queryString}` 
            : `/routes/factory/${factoryId}`;
        
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch routes' };
    }
};

// Get single route by ID
export const getRouteById = async (routeId) => {
    try {
        const response = await axios.get(`/routes/${routeId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch route' };
    }
};

// Create a new route
export const createRoute = async (routeData) => {
    try {
        const response = await axios.post('/routes', routeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create route' };
    }
};

// Update route
export const updateRoute = async (routeId, routeData) => {
    try {
        const response = await axios.put(`/routes/${routeId}`, routeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update route' };
    }
};

// Delete route (soft delete - sets status to Inactive)
export const deleteRoute = async (routeId) => {
    try {
        const response = await axios.delete(`/routes/${routeId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete route' };
    }
};

// Get route statistics
export const getRouteStatistics = async (routeId) => {
    try {
        const response = await axios.get(`/routes/${routeId}/statistics`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch route statistics' };
    }
};

// Update route supplier count
export const updateRouteSupplierCount = async (routeId, count) => {
    try {
        const response = await axios.put(`/routes/${routeId}/update-supplier-count`, { 
            supplierCount: count 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update supplier count' };
    }
};
