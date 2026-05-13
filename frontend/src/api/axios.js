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

// Global Response Interceptor
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const isAuthError = status === 401 || status === 403;

    // Development-only error logger for easier diagnostics
    if (import.meta.env?.DEV) {
      try {
        const method = (error?.config?.method || 'GET').toUpperCase();
        const url = error?.config?.url || '';
        const msg = error?.response?.data?.message || error?.message;
        // eslint-disable-next-line no-console
        console.debug(`[API ${method} ${url}] -> ${status || 'ERR'}: ${msg}`);
        // eslint-disable-next-line no-console
        if (error?.response?.data && typeof error.response.data === 'object') console.debug('Response body:', error.response.data);
      } catch {
        // ignore logging errors
      }
    }

    // Handle authentication failures (e.g., "No authentication token, access denied")
    if (isAuthError) {
      // eslint-disable-next-line no-console
      console.warn('[axios] Unauthorized access or expired token detected. Redirecting to login...');
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Prevent infinite redirect loop if somehow a 401 is triggered on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/landing') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
