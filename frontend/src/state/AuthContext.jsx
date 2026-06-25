import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../api';

const AuthCtx = createContext();

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // user en estado; localStorage solo para mostrar info rápida entre recargas
  const [user, setUser] = useState(() => safeParse('user'));
  const [mustChangePassword, setMustChangePassword] = useState(
    () => localStorage.getItem('mustChangePassword') === 'true',
  );
  const [authLoading, setAuthLoading] = useState(true);

  // Al montar: intentar renovar la sesión con la cookie httpOnly
  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        // Cookie expirada o no existe — limpiar estado
        clearAccessToken();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('mustChangePassword');
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Escuchar evento de logout disparado por el interceptor de axios
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setMustChangePassword(false);
      localStorage.removeItem('user');
      localStorage.removeItem('mustChangePassword');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.mustChangePassword) {
      localStorage.setItem('mustChangePassword', 'true');
      setMustChangePassword(true);
    } else {
      localStorage.removeItem('mustChangePassword');
      setMustChangePassword(false);
    }
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    setMustChangePassword(false);
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    clearAccessToken();
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('user');
    localStorage.removeItem('mustChangePassword');
  };

  const passwordChanged = () => {
    localStorage.removeItem('mustChangePassword');
    setMustChangePassword(false);
  };

  return (
    <AuthCtx.Provider value={{ user, mustChangePassword, authLoading, login, register, logout, passwordChanged }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
