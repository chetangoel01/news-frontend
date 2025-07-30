// Supabase Configuration for React Native
// This file handles Supabase credentials properly for React Native apps

// For React Native, we need to handle environment variables differently
// than Node.js because the final bundle is static

// Option 1: Use Expo Constants (recommended for Expo apps)
import Constants from 'expo-constants';

// Option 2: Use a config file that gets updated during build
// This is the most reliable approach for React Native

// Get Supabase URL - try multiple sources
const getSupabaseUrl = () => {
  // Try Expo Constants first (for Expo apps)
  if (Constants.expoConfig?.extra?.supabaseUrl) {
    return Constants.expoConfig.extra.supabaseUrl;
  }
  
  // Try process.env (works in development)
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL;
  }
  
  // Fallback to hardcoded value (for production)
  return 'https://fdtupnezbxurutavplfh.supabase.co';
};

// Get Supabase anon key - try multiple sources
const getSupabaseAnonKey = () => {
  // Try Expo Constants first (for Expo apps)
  if (Constants.expoConfig?.extra?.supabaseAnonKey) {
    return Constants.expoConfig.extra.supabaseAnonKey;
  }
  
  // Try process.env (works in development)
  if (process.env.SUPABASE_ANON_KEY) {
    return process.env.SUPABASE_ANON_KEY;
  }
  
  // Fallback - this should be replaced during build
  return 'YOUR_SUPABASE_ANON_KEY';
};

export const SUPABASE_CONFIG = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
};

// Validate configuration
export const validateSupabaseConfig = () => {
  const issues = [];
  
  if (!SUPABASE_CONFIG.url) {
    issues.push('SUPABASE_URL is not configured');
  }
  
  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    issues.push('SUPABASE_ANON_KEY is not configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Helper to get full configuration
export const getSupabaseConfig = () => {
  const validation = validateSupabaseConfig();
  if (!validation.isValid) {
    console.warn('Supabase configuration issues:', validation.issues);
  }
  return SUPABASE_CONFIG;
};

// Configuration info for debugging
export const getConfigInfo = () => {
  return {
    url: SUPABASE_CONFIG.url,
    anonKeyConfigured: !!SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY',
    validation: validateSupabaseConfig(),
    source: {
      expoConstants: !!Constants.expoConfig?.extra?.supabaseUrl,
      processEnv: !!process.env.SUPABASE_URL,
      fallback: !Constants.expoConfig?.extra?.supabaseUrl && !process.env.SUPABASE_URL,
    }
  };
}; 