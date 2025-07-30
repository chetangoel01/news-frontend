import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { CURRENT_API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = CURRENT_API_CONFIG.baseURL;
const API_VERSION = CURRENT_API_CONFIG.version;

// Create axios instance
const api = axios.create({
  baseURL: API_VERSION ? `${API_BASE_URL}/api/${API_VERSION}` : API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds for feed requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug logging for API requests
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`⏱️  Timeout: ${config.timeout}ms`);
      
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          await SecureStore.setItemAsync('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // You can emit an event here to notify the app to redirect to login
        console.log('Token refresh failed, redirecting to login');
      }
    }

    // Log error details
    if (error.code === 'ECONNABORTED') {
      console.error(`⏰ Timeout Error: ${error.config?.url} (${error.config?.timeout}ms)`);
    } else if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.config?.url}`);
    } else {
      console.error(`🌐 Network Error: ${error.message} (${error.config?.url})`);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    APPLE: '/auth/apple',
  },
  
  // User Management
  USER: {
    PROFILE: '/users/profile',
    EMBEDDING_UPDATE: '/users/embedding/update',
    EMBEDDING_STATUS: '/users/embedding/status',
  },
  
  // Articles
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (id) => `/articles/${id}`,
    LIKE: (id) => `/articles/${id}/like`,
    UNLIKE: (id) => `/articles/${id}/like`,
    SHARE: (id) => `/articles/${id}/share`,
    BOOKMARK: (id) => `/articles/${id}/bookmark`,
    SIMILAR: (id) => `/articles/${id}/similar`,
    ANALYTICS: (id) => `/articles/${id}/analytics`,
  },
  
  // Feed
  FEED: {
    PERSONALIZED: '/feed/personalized',
    TRENDING: '/feed/trending',
  },
  
  // Search
  SEARCH: {
    ARTICLES: '/search/articles',
  },
  
  // Bookmarks
  BOOKMARKS: {
    LIST: '/users/bookmarks',
  },
  
  // ML & Analytics
  ML: {
    MODEL_STATUS: '/ml/model-status',
  },
};

export default api; 