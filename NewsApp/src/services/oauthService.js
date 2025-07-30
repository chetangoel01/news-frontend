import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import authService from './authService';
import { OAUTH_CONFIG } from '../config/oauth';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

class OAuthService {
  constructor() {
    // No Google Sign-In SDK configuration needed for Expo Go
  }

  // Google OAuth using Expo AuthSession (works with Expo Go)
  async googleSignIn() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
        scopes: OAUTH_CONFIG.GOOGLE.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {
          nonce: await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Math.random().toString(),
            { encoding: Crypto.CryptoEncoding.HEX }
          ),
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        // Authenticate with our backend
        const authResult = await authService.googleAuth(result.params.id_token);
        return authResult;
      } else {
        throw new Error('Google OAuth was cancelled or failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Google OAuth failed: ' + error.message);
    }
  }

  // Apple OAuth using Expo AuthSession
  async appleSignIn() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: OAUTH_CONFIG.APPLE.CLIENT_ID,
        scopes: OAUTH_CONFIG.APPLE.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {
          nonce: await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Math.random().toString(),
            { encoding: Crypto.CryptoEncoding.HEX }
          ),
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
      });

      if (result.type === 'success' && result.params.id_token) {
        // Authenticate with our backend
        const authResult = await authService.appleAuth(result.params.id_token);
        return authResult;
      } else {
        throw new Error('Apple OAuth was cancelled or failed');
      }
    } catch (error) {
      console.error('Apple OAuth error:', error);
      throw new Error('Apple OAuth failed: ' + error.message);
    }
  }

  // Check if OAuth is available (for Expo Go compatibility)
  isOAuthAvailable() {
    return true; // Always available with Expo AuthSession
  }

  // Get OAuth status (for debugging)
  async getOAuthStatus() {
    try {
      return {
        google: {
          available: true,
          clientId: OAUTH_CONFIG.GOOGLE.WEB_CLIENT_ID ? 'Configured' : 'Not configured',
        },
        apple: {
          available: true,
          clientId: OAUTH_CONFIG.APPLE.CLIENT_ID ? 'Configured' : 'Not configured',
        },
      };
    } catch (error) {
      console.error('Get OAuth status error:', error);
      return {
        google: { available: false, error: error.message },
        apple: { available: false, error: error.message },
      };
    }
  }
}

export default new OAuthService(); 