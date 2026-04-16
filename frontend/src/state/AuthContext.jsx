import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

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
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const saved = safeParse('user');
    if (saved) setUser(saved);
    if (localStorage.getItem('mustChangePassword') === 'true') setMustChangePassword(true);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

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
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setMustChangePassword(false);
  };

  const passwordChanged = () => {
    localStorage.removeItem('mustChangePassword');
    setMustChangePassword(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mustChangePassword');
    setUser(null);
    setMustChangePassword(false);
  };

  return (
    <AuthCtx.Provider value={{ user, mustChangePassword, login, register, logout, passwordChanged }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
