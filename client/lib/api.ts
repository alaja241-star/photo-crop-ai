import axios from 'axios';
import Cookies from 'js-cookie';
import type { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    profile?: User['profile'];
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'profile' | 'preferences'>>) =>
    api.put('/auth/update-profile', data),

  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/auth/update-password', data),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (token: string, data: { password: string }) =>
    api.put(`/auth/reset-password/${token}`, data),

  logout: () => api.post('/auth/logout'),
};

// Disease Analysis API
export const diseaseAPI = {
  analyze: (formData: FormData) =>
    api.post('/disease/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAnalyses: (params?: {
    page?: number;
    limit?: number;
    diseaseDetected?: boolean;
    healthStatus?: string;
    cropType?: string;
    status?: string;
  }) => api.get('/disease', { params }),

  getAnalysis: (id: string) => api.get(`/disease/${id}`),

  deleteAnalysis: (id: string) => api.delete(`/disease/${id}`),

  getStats: () => api.get('/disease/stats'),
};

// Soil Analysis API
export const soilAPI = {
  analyze: (formData: FormData) =>
    api.post('/soil/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAnalyses: (params?: {
    page?: number;
    limit?: number;
    soilType?: string;
    fertilityLevel?: string;
    status?: string;
  }) => api.get('/soil', { params }),

  getAnalysis: (id: string) => api.get(`/soil/${id}`),

  deleteAnalysis: (id: string) => api.delete(`/soil/${id}`),

  getStats: () => api.get('/soil/stats'),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: (lat: number, lon: number) =>
    api.get('/weather/current', { params: { lat, lon } }),

  getForecast: (lat: number, lon: number, days?: number) =>
    api.get('/weather/forecast', { params: { lat, lon, days } }),

  getAgriculturalWeather: (lat: number, lon: number) =>
    api.get('/weather/agricultural', { params: { lat, lon } }),

  getLocationWeather: (location: string) =>
    api.get(`/weather/location/${location}`),

  getCropRecommendations: (data: {
    lat: number;
    lon: number;
    soilData?: Record<string, unknown>;
    location?: Record<string, unknown>;
  }) => api.post('/weather/crop-recommendations', data),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),

  getReports: (params?: {
    page?: number;
    limit?: number;
    type?: 'disease' | 'soil';
  }) => api.get('/reports', { params }),

  getReport: (type: 'disease' | 'soil', id: string) =>
    api.get(`/reports/${type}/${id}`),

  deleteReport: (type: 'disease' | 'soil', id: string) =>
    api.delete(`/reports/${type}/${id}`),

  getCropRecommendations: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/reports/crop-recommendations', { params }),

  getCropRecommendation: (id: string) =>
    api.get(`/reports/crop-recommendations/${id}`),

  deleteCropRecommendation: (id: string) =>
    api.delete(`/reports/crop-recommendations/${id}`),

  // Export functions
  exportToPDF: (data: { filter: string; searchTerm: string }) =>
    api.post('/reports/export/pdf', data, { responseType: 'blob' }),

  exportToExcel: (data: { filter: string; searchTerm: string }) =>
    api.post('/reports/export/excel', data, { responseType: 'blob' }),
};

/**
 * Fetch a protected analysis image through the authenticated axios instance
 * and return an object URL suitable for an <img src>. `imageUrl` is the
 * absolute API path stored on the analysis (e.g. `/api/disease/<id>/image`);
 * the leading `/api` is stripped because the axios baseURL already ends in `/api`.
 */
export const fetchImageObjectUrl = async (imageUrl: string): Promise<string> => {
  const res = await api.get(imageUrl.replace(/^\/api/, ''), { responseType: 'blob' });
  return URL.createObjectURL(res.data as Blob);
};

export default api;
