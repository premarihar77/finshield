import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api, { TOKEN_KEY, USER_KEY, clearStoredAuth, getStoredToken, setAuthToken } from '../api/api';

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => readSavedUser());
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setAuthToken(storedToken);

    api.get('/api/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          logout(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout(false);
    window.addEventListener('finshield:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('finshield:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuthToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      toast.success('Welcome back to FinShield');
      return true;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    await api.post('/api/auth/register', { name, email, password });
    toast.success('Account created. Please log in.');
  };

  const logout = (showToast = true) => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    if (showToast) toast.success('Logged out');
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading: loading || authLoading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token)
    }),
    [user, token, loading, authLoading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
