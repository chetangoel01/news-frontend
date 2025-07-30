import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseConfig, validateSupabaseConfig } from '../config/supabase';
import api, { ENDPOINTS } from './api';

// Get Supabase configuration
const supabaseConfig = getSupabaseConfig();

// Create Supabase client
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

class SupabaseAuthService {
  constructor() {
    this.supabase = supabase;
    
    // Validate configuration on initialization
    const validation = validateSupabaseConfig();
    if (!validation.isValid) {
      console.warn('Supabase Auth Service: Configuration issues detected:', validation.issues);
    }
  }

  // Google OAuth with Supabase (React Native approach)
  async googleSignIn() {
    try {
      // Validate configuration before proceeding
      const validation = validateSupabaseConfig();
      if (!validation.isValid) {
        throw new Error(`Supabase configuration error: ${validation.issues.join(', ')}`);
      }

      // For React Native, we need to use the native Google Sign-In
      // This will be handled by the native module, not web OAuth
      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: 'google',
        token: 'id_token_from_native_google_signin', // This will be replaced by actual token
        nonce: 'nonce_from_native_google_signin', // This will be replaced by actual nonce
        access_token: 'access_token_from_native_google_signin', // This will be replaced by actual access token
      });

      if (error) {
        throw new Error(`Google OAuth failed: ${error.message}`);
      }

      // Get the user session after OAuth
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Failed to get user session after OAuth');
      }

      // Bridge to your backend API
      const backendResult = await this.authenticateWithBackend(session);
      
      return {
        success: true,
        data: data,
        user: session.user,
        session: session,
        backendAuth: backendResult,
      };
    } catch (error) {
      console.error('Supabase Google OAuth error:', error);
      throw new Error('Google OAuth failed: ' + error.message);
    }
  }

  // Bridge Supabase auth to your backend
  async authenticateWithBackend(supabaseSession) {
    try {
      // Get the ID token from Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('Failed to get user from Supabase');
      }

      // Get the ID token (this is what your backend expects)
      const { data: { session } } = await this.supabase.auth.getSession();
      const idToken = session?.access_token;

      if (!idToken) {
        throw new Error('No access token available from Supabase');
      }

      // Send to your backend API
      const response = await api.post(ENDPOINTS.AUTH.GOOGLE, { 
        id_token: idToken,
        supabase_user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      });

      const { access_token, refresh_token, user_id } = response.data;
      
      // Store backend tokens securely
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      await SecureStore.setItemAsync('user_id', user_id);
      
      // Store user profile
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data.user_profile));
      
      // Also store Supabase session for future use
      await SecureStore.setItemAsync('supabase_session', JSON.stringify(supabaseSession));
      
      return response.data;
    } catch (error) {
      console.error('Backend authentication error:', error);
      throw new Error('Failed to authenticate with backend: ' + error.message);
    }
  }

  // Apple OAuth with Supabase (React Native approach)
  async appleSignIn() {
    try {
      // For React Native, we need to use the native Apple Sign-In
      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: 'id_token_from_native_apple_signin', // This will be replaced by actual token
        nonce: 'nonce_from_native_apple_signin', // This will be replaced by actual nonce
      });

      if (error) {
        throw new Error(`Apple OAuth failed: ${error.message}`);
      }

      // Get the user session after OAuth
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Failed to get user session after OAuth');
      }

      // Bridge to your backend API
      const backendResult = await this.authenticateWithBackend(session);
      
      return {
        success: true,
        data: data,
        user: session.user,
        session: session,
        backendAuth: backendResult,
      };
    } catch (error) {
      console.error('Supabase Apple OAuth error:', error);
      throw new Error('Apple OAuth failed: ' + error.message);
    }
  }

  // Email/Password sign in
  async emailSignIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Email sign in failed: ${error.message}`);
      }

      // Bridge to your backend API
      const backendResult = await this.authenticateWithBackend(data.session);
      
      return {
        success: true,
        data: data,
        user: data.user,
        session: data.session,
        backendAuth: backendResult,
      };
    } catch (error) {
      console.error('Supabase email sign in error:', error);
      throw new Error('Email sign in failed: ' + error.message);
    }
  }

  // Email/Password sign up
  async emailSignUp(email, password, userData = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user metadata
        },
      });

      if (error) {
        throw new Error(`Email sign up failed: ${error.message}`);
      }

      // Bridge to your backend API
      const backendResult = await this.authenticateWithBackend(data.session);
      
      return {
        success: true,
        data: data,
        user: data.user,
        session: data.session,
        backendAuth: backendResult,
      };
    } catch (error) {
      console.error('Supabase email sign up error:', error);
      throw new Error('Email sign up failed: ' + error.message);
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }

      // Also clear backend tokens
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user_id');
      await SecureStore.deleteItemAsync('supabase_session');
      await AsyncStorage.removeItem('user_profile');

      return { success: true };
    } catch (error) {
      console.error('Supabase sign out error:', error);
      throw new Error('Sign out failed: ' + error.message);
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        throw new Error(`Get user failed: ${error.message}`);
      }

      return user;
    } catch (error) {
      console.error('Supabase get user error:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Get session failed: ${error.message}`);
      }

      return session;
    } catch (error) {
      console.error('Supabase get session error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Check if OAuth is available
  isOAuthAvailable() {
    const validation = validateSupabaseConfig();
    return validation.isValid; // Only available if properly configured
  }

  // Check if OAuth flow is in progress
  async isOAuthInProgress() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Get OAuth status (for debugging)
  async getOAuthStatus() {
    try {
      const validation = validateSupabaseConfig();
      if (!validation.isValid) {
        return {
          google: { available: false, error: validation.issues.join(', ') },
          apple: { available: false, error: validation.issues.join(', ') },
          session: 'Configuration Error',
        };
      }

      const session = await this.getCurrentSession();
      const user = await this.getCurrentUser();
      
      return {
        google: {
          available: true,
          configured: true,
          user: user ? 'Signed in' : 'Not signed in',
        },
        apple: {
          available: true,
          configured: true,
          user: user ? 'Signed in' : 'Not signed in',
        },
        session: session ? 'Active' : 'No session',
      };
    } catch (error) {
      console.error('Get OAuth status error:', error);
      return {
        google: { available: false, error: error.message },
        apple: { available: false, error: error.message },
        session: 'Error',
      };
    }
  }

  // Get configuration info (for debugging)
  getConfigurationInfo() {
    return {
      url: supabaseConfig.url,
      anonKeyConfigured: !!supabaseConfig.anonKey && supabaseConfig.anonKey !== 'YOUR_SUPABASE_ANON_KEY',
      validation: validateSupabaseConfig(),
    };
  }
}

export default new SupabaseAuthService(); 