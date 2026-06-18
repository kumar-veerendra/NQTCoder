import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import * as executionService from '../services/executionService';
import { calculateStreakDetails } from '../utils/profileHelpers';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (currentUser = null) => {
    try {
      const [profileData, submissions] = await Promise.all([
        authService.getProfile(),
        executionService.getUserSubmissions()
      ]);
      const { currentStreak, maxStreak } = calculateStreakDetails(submissions);
      const solvedQuestionIds = (profileData.solvedQuestions || []).map(q => 
        typeof q === 'object' ? q._id : q
      );
      
      setUser(prevUser => {
        const baseUser = currentUser || prevUser || JSON.parse(localStorage.getItem('userInfo'));
        if (!baseUser) return null;
        
        const updatedUser = {
          ...baseUser,
          solvedQuestions: solvedQuestionIds,
          solvedCount: profileData.solvedCount || { easy: 0, medium: 0, hard: 0 },
          fullName: profileData.fullName || '',
          bio: profileData.bio || '',
          currentStreak,
          maxStreak
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        return updatedUser;
      });
    } catch (err) {
      console.error('Failed to refresh user details:', err);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('userInfo', JSON.stringify(newUserData));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      refreshUser(parsed);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      refreshUser(data);
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
      refreshUser(data);
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
      refreshUser(data);
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
      refreshUser(data);
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
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

