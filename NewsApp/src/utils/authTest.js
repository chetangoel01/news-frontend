// Authentication Test Utility
// Use this to debug authentication issues

import * as SecureStore from 'expo-secure-store';
import api, { ENDPOINTS } from '../services/api';

/**
 * Test authentication status
 */
export const testAuthStatus = async () => {
  console.log('🔍 Testing authentication status...');
  
  try {
    // Check if tokens exist
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const userId = await SecureStore.getItemAsync('user_id');
    
    console.log('📋 Token Status:');
    console.log(`  Access Token: ${accessToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Refresh Token: ${refreshToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`  User ID: ${userId ? '✅ Present' : '❌ Missing'}`);
    
    if (!accessToken) {
      console.log('❌ No access token found. User needs to login.');
      return { authenticated: false, reason: 'No access token' };
    }
    
    // Test API call with current token
    try {
      const response = await api.get('/users/profile');
      console.log('✅ Authentication successful!');
      console.log(`  User Profile: ${response.data.username || 'Unknown'}`);
      return { authenticated: true, user: response.data };
    } catch (error) {
      console.log('❌ Authentication failed:');
      console.log(`  Status: ${error.response?.status}`);
      console.log(`  Message: ${error.response?.data?.detail || error.message}`);
      
      if (error.response?.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');
        return await testTokenRefresh();
      }
      
      return { authenticated: false, reason: error.response?.data?.detail || error.message };
    }
    
  } catch (error) {
    console.error('❌ Error testing auth status:', error);
    return { authenticated: false, reason: error.message };
  }
};

/**
 * Test token refresh
 */
export const testTokenRefresh = async () => {
  console.log('🔄 Testing token refresh...');
  
  try {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return { authenticated: false, reason: 'No refresh token' };
    }
    
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    });
    
    const { access_token } = response.data;
    await SecureStore.setItemAsync('access_token', access_token);
    
    console.log('✅ Token refresh successful!');
    return { authenticated: true, refreshed: true };
    
  } catch (error) {
    console.log('❌ Token refresh failed:');
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Message: ${error.response?.data?.detail || error.message}`);
    
    // Clear invalid tokens
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_id');
    
    return { authenticated: false, reason: 'Token refresh failed' };
  }
};

/**
 * Test view tracking with authentication
 */
export const testViewTracking = async (articleId) => {
  console.log(`🔍 Testing view tracking for article: ${articleId}`);
  
  try {
    // First check authentication
    const authStatus = await testAuthStatus();
    
    if (!authStatus.authenticated) {
      console.log('❌ Not authenticated, cannot test view tracking');
      return { success: false, reason: 'Not authenticated' };
    }
    
    // Test view tracking
    const viewData = {
      read_time_seconds: 30,
      interaction_strength: 0.8,
      interaction_type: 'view'
    };
    
    const response = await api.post(`/articles/${articleId}/view`, viewData);
    
    console.log('✅ View tracking successful!');
    console.log(`  Response: ${JSON.stringify(response.data)}`);
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ View tracking failed:');
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Message: ${error.response?.data?.detail || error.message}`);
    
    return { 
      success: false, 
      status: error.response?.status,
      reason: error.response?.data?.detail || error.message 
    };
  }
};

/**
 * Quick login test
 */
export const testLogin = async (email = 'test@example.com', password = 'testpassword') => {
  console.log('🔍 Testing login...');
  
  try {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`  User: ${response.data.user_profile?.username || 'Unknown'}`);
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Message: ${error.response?.data?.detail || error.message}`);
    
    return { 
      success: false, 
      status: error.response?.status,
      reason: error.response?.data?.detail || error.message 
    };
  }
};

// Export all functions for easy access
export default {
  testAuthStatus,
  testTokenRefresh,
  testViewTracking,
  testLogin
}; 