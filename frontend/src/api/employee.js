import api from './axios';

// Create new employee
export const createEmployee = async (employeeData) => {
    try {
        const response = await api.post('/employees', employeeData);
        return response.data;
    } catch (error) {
        console.error('Create employee error:', error);
        throw error;
    }
};

// Get all employees (with optional filters)
export const getAllEmployees = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.department) params.append('department', filters.department);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        
        const url = params.toString() ? `/employees?${params.toString()}` : '/employees';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Get employees error:', error);
        throw error;
    }
};

// Get single employee by ID
export const getEmployeeById = async (id) => {
    try {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get employee error:', error);
        throw error;
    }
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
    try {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data;
    } catch (error) {
        console.error('Update employee error:', error);
        throw error;
    }
};

// Delete employee
export const deleteEmployee = async (id) => {
    try {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete employee error:', error);
        throw error;
    }
};

// Get employee statistics
export const getEmployeeStats = async () => {
    try {
        const response = await api.get('/employees/stats');
        return response.data;
    } catch (error) {
        console.error('Get employee stats error:', error);
        throw error;
    }
};
