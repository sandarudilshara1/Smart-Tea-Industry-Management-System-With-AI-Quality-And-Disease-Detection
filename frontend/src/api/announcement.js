import api from './axios';

// Create new announcement
export const createAnnouncement = async (announcementData) => {
    try {
        const response = await api.post('/announcements', announcementData);
        return response.data;
    } catch (error) {
        console.error('Create announcement error:', error);
        throw error;
    }
};

// Get all announcements (with optional factory filter)
export const getAllAnnouncements = async (factoryId = null) => {
    try {
        const url = factoryId 
            ? `/announcements?factoryId=${factoryId}` 
            : '/announcements';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Get announcements error:', error);
        throw error;
    }
};

// Get single announcement by ID
export const getAnnouncementById = async (id) => {
    try {
        const response = await api.get(`/announcements/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get announcement error:', error);
        throw error;
    }
};

// Update announcement
export const updateAnnouncement = async (id, announcementData) => {
    try {
        const response = await api.put(`/announcements/${id}`, announcementData);
        return response.data;
    } catch (error) {
        console.error('Update announcement error:', error);
        throw error;
    }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
    try {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete announcement error:', error);
        throw error;
    }
};

// Get announcements by topic
export const getAnnouncementsByTopic = async (topic, factoryId = null) => {
    try {
        const url = factoryId 
            ? `/announcements/topic/${topic}?factoryId=${factoryId}` 
            : `/announcements/topic/${topic}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Get announcements by topic error:', error);
        throw error;
    }
};
