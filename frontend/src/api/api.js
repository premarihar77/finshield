import axios from 'axios';

export const TOKEN_KEY = 'finshield_token';
export const USER_KEY = 'finshield_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
});

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setAuthToken(null);
}

setAuthToken(getStoredToken());

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginOrRegister = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register');
    const hadToken = Boolean(getStoredToken() || error.config?.headers?.Authorization);

    if (status === 401 && hadToken && !isLoginOrRegister) {
      clearStoredAuth();
      window.dispatchEvent(new Event('finshield:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default api;
