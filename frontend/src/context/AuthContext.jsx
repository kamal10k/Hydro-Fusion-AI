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
      setLoading(false);
      if (res.requires_otp) {
        return { 
          success: true, 
          requiresOtp: true, 
          loginAttemptId: res.login_attempt_id, 
          emailMasked: res.email_masked 
        };
      }
      localStorage.setItem('hydro_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (loginAttemptId, otp) => {
    setLoading(true);
    try {
      const res = await api.verifyLoginOtp(loginAttemptId, otp);
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

  const resendOtp = async (loginAttemptId) => {
    setLoading(true);
    try {
      const res = await api.resendLoginOtp(loginAttemptId);
      setLoading(false);
      return { 
        success: true, 
        message: res.message, 
        loginAttemptId: res.login_attempt_id, 
        emailMasked: res.email_masked 
      };
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
      if (res.requires_verification) {
        return { 
          success: true, 
          requiresVerification: true, 
          registrationToken: res.registration_token, 
          email: res.email, 
          emailMasked: res.email_masked, 
          message: res.message 
        };
      }
      return { success: true, message: res.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const verifyRegistrationEmail = async (registrationToken, code, email = '') => {
    setLoading(true);
    try {
      const res = await api.verifyEmail(registrationToken, code, email);
      setLoading(false);
      return { success: true, message: res.message };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const resendRegistrationEmail = async (registrationToken, email = '') => {
    setLoading(true);
    try {
      const res = await api.resendVerification(registrationToken, email);
      setLoading(false);
      return { 
        success: true, 
        message: res.message, 
        registrationToken: res.registration_token, 
        emailMasked: res.email_masked 
      };
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

  const resetPassword = async (token, newPassword, confirmPassword) => {
    setLoading(true);
    try {
      const res = await api.resetPassword(token, newPassword, confirmPassword);
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
      verifyOtp,
      resendOtp,
      register,
      verifyRegistrationEmail,
      resendRegistrationEmail,
      forgotPassword,
      resetPassword,
      logout,
      setUser
    }}>


      {children}
    </AuthContext.Provider>
  );
};
