import api, { ENDPOINTS } from './api';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      console.log('🔍 AuthService: Registering user with data:', JSON.stringify(userData, null, 2));
      console.log('🔍 AuthService: Using endpoint:', ENDPOINTS.AUTH.REGISTER);
      
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      console.log('🔍 AuthService: Registration successful:', response.status);
      
      const { access_token, refresh_token, user_id } = response.data;
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      await SecureStore.setItemAsync('user_id', user_id);
      
      // Store user profile in AsyncStorage for quick access
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('🔍 AuthService: Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw this.handleError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
      const { access_token, refresh_token, user_id } = response.data;
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      await SecureStore.setItemAsync('user_id', user_id);
      
      // Store user profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data.user_profile));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  // Google OAuth authentication
  async googleAuth(idToken) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.GOOGLE, { id_token: idToken });
      const { access_token, refresh_token, user_id } = response.data;
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      await SecureStore.setItemAsync('user_id', user_id);
      
      // Store user profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data.user_profile));
      
      return response.data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw this.handleError(error);
    }
  }

  // Apple OAuth authentication
  async appleAuth(idToken) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.APPLE, { id_token: idToken });
      const { access_token, refresh_token, user_id } = response.data;
      
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      await SecureStore.setItemAsync('user_id', user_id);
      
      // Store user profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data.user_profile));
      
      return response.data;
    } catch (error) {
      console.error('Apple OAuth error:', error);
      throw this.handleError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      // Clear all stored data
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user_id');
      await AsyncStorage.removeItem('user_profile');
      await AsyncStorage.removeItem('user_preferences');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        return JSON.parse(userProfile);
      }
      
      // If not in cache, fetch from API
      const response = await api.get(ENDPOINTS.USER.PROFILE);
      const profile = response.data;
      
      // Cache the profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      
      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put(ENDPOINTS.USER.PROFILE, profileData);
      const updatedProfile = response.data;
      
      // Update cached profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleError(error);
    }
  }

  // Get user preferences
  async getUserPreferences() {
    try {
      const cached = await AsyncStorage.getItem('user_preferences');
      if (cached) {
        return JSON.parse(cached);
      }
      
      const user = await this.getCurrentUser();
      const preferences = user.preferences || {};
      
      // Cache preferences
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
      
      return preferences;
    } catch (error) {
      console.error('Get preferences error:', error);
      return {};
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await api.put(ENDPOINTS.USER.PROFILE, { preferences });
      
      // Update cached preferences
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
      
      // Update cached profile
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        profile.preferences = preferences;
        await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Check for specific error details
          if (data.detail) {
            if (typeof data.detail === 'string') {
              return new Error(data.detail);
            } else if (Array.isArray(data.detail)) {
              // Handle validation errors
              const errors = data.detail.map(err => err.msg || err.message).join(', ');
              return new Error(errors);
            }
          }
          return new Error(data.error?.message || 'Invalid request');
        case 401:
          return new Error('Invalid credentials');
        case 403:
          return new Error('Access denied');
        case 404:
          return new Error('Resource not found');
        case 409:
          return new Error('User already exists');
        case 422:
          // Validation error
          if (data.detail) {
            if (Array.isArray(data.detail)) {
              const errors = data.detail.map(err => {
                const field = err.loc ? err.loc.join('.') : 'unknown';
                const message = err.msg || err.message;
                return `${field}: ${message}`;
              }).join(', ');
              return new Error(errors);
            }
            return new Error(data.detail);
          }
          return new Error('Validation error');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data.error?.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error('An unexpected error occurred');
    }
  }

  // Get stored tokens (for debugging)
  async getTokens() {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const userId = await SecureStore.getItemAsync('user_id');
      
      return {
        accessToken,
        refreshToken,
        userId,
      };
    } catch (error) {
      console.error('Get tokens error:', error);
      return {};
    }
  }
}

export default new AuthService(); 