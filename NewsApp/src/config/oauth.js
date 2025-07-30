// OAuth Configuration for Expo Go
// Update these values with your actual OAuth client IDs

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    // Web Client ID (for Expo AuthSession - works with Expo Go)
    WEB_CLIENT_ID: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    
    // Scopes for Google OAuth
    SCOPES: ['openid', 'profile', 'email'],
  },
  
  // Apple OAuth Configuration
  APPLE: {
    // Apple Service ID (Client ID)
    CLIENT_ID: 'YOUR_APPLE_SERVICE_ID',
    
    // Scopes for Apple OAuth
    SCOPES: ['name', 'email'],
  },
};

// Instructions for setting up OAuth with Expo Go:
// 
// 1. Google OAuth Setup:
//    - Go to Google Cloud Console (https://console.cloud.google.com/)
//    - Create a new project or select existing one
//    - Enable Google+ API and Google Sign-In API
//    - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
//    - Create Web application client ID (for Expo AuthSession)
//    - Authorized redirect URIs: 
//      - https://auth.expo.io/@your-expo-username/your-app-slug
//      - https://your-app-slug.exp.direct
//    - Update the WEB_CLIENT_ID above with your client ID
//
// 2. Apple OAuth Setup:
//    - Go to Apple Developer Console (https://developer.apple.com/)
//    - Create a new App ID or select existing one
//    - Enable Sign In with Apple capability
//    - Create a Services ID for your app
//    - Update the CLIENT_ID above with your Services ID
//
// 3. Update this file with your actual client IDs
// 4. Test with Expo Go - no native compilation required!
//
// Note: This configuration works with Expo Go and doesn't require
// platform-specific client IDs or native compilation. 