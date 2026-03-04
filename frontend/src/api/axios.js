import axios from "axios";

// Backend API base URL - connects to Node.js + MongoDB backend
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";
const instance = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

instance.interceptors.request.use(
  async (config) => {
    // Get JWT token from localStorage (set during login/register)
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Log warning if no token is found for authenticated endpoints
      if (config.url && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
        console.warn('[axios] No auth token found for request:', config.method?.toUpperCase(), config.url);
      }
    }
    // Helpful marker for servers that rely on detecting AJAX requests
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

// Development-only error logger for easier diagnostics
if (import.meta.env?.DEV) {
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      try {
        const method = (error?.config?.method || 'GET').toUpperCase();
        const url = error?.config?.url || '';
        const status = error?.response?.status;
        const msg = error?.response?.data?.message || error?.message;
        // Avoid logging tokens or sensitive headers
        // eslint-disable-next-line no-console
        console.debug(`[API ${method} ${url}] -> ${status || 'ERR'}: ${msg}`);
        // eslint-disable-next-line no-console
        if (error?.response?.data && typeof error.response.data === 'object') console.debug('Response body:', error.response.data);
      } catch {
        // ignore logging errors
      }
      return Promise.reject(error);
    }
  );
}

export default instance;
