'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    profile?: any;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to get user:', error);
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, data: userData } = response.data;

      Cookies.set('token', token, { expires: 7 }); // 7 days
      setUser(userData);
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    profile?: any;
  }) => {
    try {
      const response = await authAPI.register(data);
      const { token, data: userData } = response.data;

      Cookies.set('token', token, { expires: 7 }); // 7 days
      setUser(userData);
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Password update failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
