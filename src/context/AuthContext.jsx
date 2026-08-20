import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hydro_token') || '');
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(res => {
          if (res && res.user) {
            setUser(res.user);
          } else {
            setUser(null);
            localStorage.removeItem('hydro_token');
          }
          setInitializing(false);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('hydro_token');
          setInitializing(false);
        });
    } else {
      setUser(null);
      setInitializing(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('hydro_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return { success: true, user: res.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, confirmPassword, role = 'Operator', facilityName = 'Facility Alpha') => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password, confirmPassword, role, facilityName);
      setLoading(false);
      return { success: true, message: res.message, requires_verification: res.requires_verification };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const verifyEmail = async (verifyToken) => {
    setLoading(true);
    try {
      const res = await api.verifyEmail(verifyToken);
      setLoading(false);
      return { success: true, message: res.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const resendVerification = async (targetEmail) => {
    setLoading(true);
    try {
      const res = await api.resendVerification(targetEmail);
      setLoading(false);
      return { success: true, message: res.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };


  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setLoading(false);
      return { success: true, message: res.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    setToken('');
    setUser(null);
    localStorage.removeItem('hydro_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      initializing,
      login,
      register,
      verifyEmail,
      resendVerification,
      forgotPassword,

      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
