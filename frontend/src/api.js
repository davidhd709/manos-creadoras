import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // envía la cookie httpOnly en cada request
});

// Token en memoria (no en localStorage) — más seguro ante XSS
let _accessToken = null;
export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// Cola de requests que esperan el refresh
let _isRefreshing = false;
let _waitingQueue = [];

const processQueue = (token, error = null) => {
  _waitingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  _waitingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Evitar loop infinito en el propio endpoint de refresh
    if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')) {
      clearAccessToken();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _waitingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    _isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      setAccessToken(data.access_token);
      processQueue(data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch (refreshError) {
      processQueue(null, refreshError);
      clearAccessToken();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);

export default api;
