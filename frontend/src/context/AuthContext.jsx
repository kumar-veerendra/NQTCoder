import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || { auth: error.response?.data?.message || 'Login failed' }
      };
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      const data = await authService.register(username, email, password, confirmPassword);
      if (data.verificationRequired) {
        return { success: true, verificationRequired: true, email: data.email };
      }
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || { message: error.response?.data?.message || 'Registration failed' }
      };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const data = await authService.verifyEmail(email, code);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || { message: error.response?.data?.message || 'Verification failed' }
      };
    }
  };

  const resendCode = async (email) => {
    try {
      await authService.resendCode(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend code'
      };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const data = await authService.googleLogin(credential);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    resendCode,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
