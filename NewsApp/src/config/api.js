// API Configuration
export const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:8000',
    version: '', // No version prefix needed
  },
  
  // Staging
  staging: {
    baseURL: 'https://staging-api.yourapp.com',
    version: '', // No version prefix needed
  },
  
  // Production
  production: {
    baseURL: 'https://api.yourapp.com',
    version: '', // No version prefix needed
  },
};

// Get current environment
const getEnvironment = () => {
  // You can set this via environment variables or build configuration
  if (__DEV__) {
    return 'development';
  }
  // Add logic to detect staging vs production
  return 'production';
};

export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// Export current config
export const CURRENT_API_CONFIG = getApiConfig();

// Test function to verify API configuration
export const testApiConfig = () => {
  const config = getApiConfig();
  console.log('🔧 API Configuration:', {
    environment: getEnvironment(),
    baseURL: config.baseURL,
    version: config.version,
    fullURL: config.version ? `${config.baseURL}/api/${config.version}` : config.baseURL
  });
  return config;
}; 