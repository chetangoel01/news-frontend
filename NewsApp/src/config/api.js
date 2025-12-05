// API Configuration
import Constants from 'expo-constants';

// Get API URL from environment or use defaults
const getApiUrl = () => {
  // Check if we're in development mode via environment variable
  if (process.env.NODE_ENV === 'development' || process.env.DEV_API === 'true') {
    console.log('🔧 Development mode - using localhost:8000');
    return 'http://localhost:8000';
  }
  
  // Try Expo Constants first (for Expo apps)
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Try process.env (works in development)
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // Fallback to production backend URL
  return 'https://newsapp.dragonchetan.com';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  version: '', // No version prefix needed
};

// Export current config
export const CURRENT_API_CONFIG = API_CONFIG;

// Test function to verify API configuration
export const testApiConfig = () => {
  console.log('🔧 API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    version: API_CONFIG.version,
    fullURL: API_CONFIG.version ? `${API_CONFIG.baseURL}/api/${API_CONFIG.version}` : API_CONFIG.baseURL,
    isDev: process.env.NODE_ENV === 'development' || process.env.DEV_API === 'true'
  });
  
  return API_CONFIG;
}; 