import api from './axios';

const ANNOUNCEMENTS_CACHE_TTL_MS = 30000;
const announcementsCache = new Map();
const announcementsInFlight = new Map();

const getAnnouncementsCacheKey = (factoryId) =>
    factoryId == null ? 'all' : `factory:${factoryId}`;

export const clearAnnouncementsCache = (factoryId = null) => {
    if (factoryId == null) {
        announcementsCache.clear();
        announcementsInFlight.clear();
        return;
    }

    const key = getAnnouncementsCacheKey(factoryId);
    announcementsCache.delete(key);
    announcementsInFlight.delete(key);
};

// Create new announcement
export const createAnnouncement = async (announcementData) => {
    try {
        const response = await api.post('/announcements', announcementData);
        clearAnnouncementsCache();
        return response.data;
    } catch (error) {
        console.error('Create announcement error:', error);
        throw error;
    }
};

// Get all announcements (with optional factory filter)
export const getAllAnnouncements = async (factoryId = null, options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = getAnnouncementsCacheKey(factoryId);
    const now = Date.now();

    if (!forceRefresh) {
        const cached = announcementsCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached.data;
        }

        const inFlight = announcementsInFlight.get(cacheKey);
        if (inFlight) {
            return inFlight;
        }
    }

    try {
        const url = factoryId 
            ? `/announcements?factoryId=${factoryId}` 
            : '/announcements';

        const requestPromise = api.get(url)
            .then((response) => {
                announcementsCache.set(cacheKey, {
                    data: response.data,
                    expiresAt: Date.now() + ANNOUNCEMENTS_CACHE_TTL_MS,
                });
                return response.data;
            })
            .finally(() => {
                announcementsInFlight.delete(cacheKey);
            });

        announcementsInFlight.set(cacheKey, requestPromise);
        return await requestPromise;
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
        clearAnnouncementsCache();
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
        clearAnnouncementsCache();
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
