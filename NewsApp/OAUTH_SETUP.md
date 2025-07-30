# 🔐 OAuth Authentication Setup Guide (Expo Go Compatible)

This guide will help you set up Google and Apple OAuth authentication for your React Native news app using Expo Go.

## 📋 Prerequisites

- Google Cloud Console account
- Apple Developer account (for Apple Sign-In)
- Expo development environment
- Expo Go app for testing

## 🚀 Quick Start

### 1. Install Dependencies

The required packages are already installed:
- `expo-auth-session` - For OAuth flows (Expo Go compatible)
- `expo-crypto` - For secure nonce generation
- `expo-web-browser` - For web-based OAuth

### 2. Configure OAuth Providers

#### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - Google+ API
     - Google Sign-In API

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"

4. **Create Web Application Client ID**
   - Application type: Web application
   - Name: "NewsApp Web Client"
   - Authorized redirect URIs: 
     - `https://auth.expo.io/@your-expo-username/your-app-slug`
     - `https://your-app-slug.exp.direct`
   - Copy the Client ID

#### Apple OAuth Setup

1. **Go to Apple Developer Console**
   - Visit [https://developer.apple.com/](https://developer.apple.com/)
   - Sign in with your Apple Developer account

2. **Create App ID**
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" > "+" > "App IDs"
   - Select "App" and click "Continue"
   - Fill in the details:
     - Description: "NewsApp"
     - Bundle ID: Your app's bundle identifier
   - Enable "Sign In with Apple" capability
   - Click "Continue" and "Register"

3. **Create Services ID**
   - Go to "Identifiers" > "+" > "Services IDs"
   - Select "Services IDs" and click "Continue"
   - Fill in the details:
     - Description: "NewsApp Sign In"
     - Identifier: `com.yourcompany.newsapp.signin`
   - Enable "Sign In with Apple" and click "Configure"
   - Add your domain and return URL
   - Click "Continue" and "Register"
   - Copy the Services ID (this is your Client ID)

### 3. Update Configuration

1. **Edit `src/config/oauth.js`**
   ```javascript
   export const OAUTH_CONFIG = {
     GOOGLE: {
       WEB_CLIENT_ID: 'your-google-web-client-id.apps.googleusercontent.com',
       SCOPES: ['openid', 'profile', 'email'],
     },
     APPLE: {
       CLIENT_ID: 'com.yourcompany.newsapp.signin',
       SCOPES: ['name', 'email'],
     },
   };
   ```

### 4. Backend Configuration

Ensure your backend has the following environment variables set:
```bash
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
APPLE_CLIENT_ID=com.yourcompany.newsapp.signin
```

## 🔧 Implementation Details

### OAuth Flow (Expo Go Compatible)

1. **User taps OAuth button** in AuthScreen
2. **Expo AuthSession** opens web browser for OAuth
3. **Provider returns ID token** to the app via redirect
4. **App sends ID token** to your backend via `/auth/google` or `/auth/apple`
5. **Backend validates token** and returns JWT tokens
6. **App stores JWT tokens** and updates UI

### Files Modified

- `src/services/api.js` - Added OAuth endpoints
- `src/services/authService.js` - Added OAuth authentication methods
- `src/services/oauthService.js` - OAuth service using Expo AuthSession
- `src/config/oauth.js` - OAuth configuration for Expo Go
- `src/screens/AuthScreen.js` - Updated with OAuth buttons
- `src/components/OAuthTestComponent.js` - Test component for Expo Go

### Error Handling

The implementation includes comprehensive error handling:
- Network errors
- Invalid tokens
- User cancellation
- Provider-specific errors

## 🧪 Testing

### Test OAuth Flows

1. **Test Google Sign-In**
   - Tap "Continue with Google" button
   - Complete Google authentication in web browser
   - Verify successful login

2. **Test Apple Sign-In**
   - Tap "Continue with Apple" button
   - Complete Apple authentication in web browser
   - Verify successful login

3. **Test Error Scenarios**
   - Test with invalid tokens
   - Test network failures
   - Test user cancellation

### Debug OAuth

Enable debug logging by checking the console for:
- OAuth request/response logs
- Token validation errors
- Network errors

## 🔒 Security Considerations

1. **Token Storage**
   - JWT tokens are stored securely using `expo-secure-store`
   - OAuth ID tokens are not stored locally

2. **Token Validation**
   - Backend validates OAuth tokens before issuing JWTs
   - JWT tokens are validated on each API request

3. **Nonce Protection**
   - OAuth requests include cryptographically secure nonces
   - Prevents replay attacks

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid client ID" error**
   - Verify client IDs in `src/config/oauth.js`
   - Ensure client IDs match your OAuth provider configuration

2. **"Redirect URI mismatch" error**
   - Check redirect URIs in Google Cloud Console
   - Ensure they match your Expo app configuration
   - Use the correct Expo redirect URIs

3. **"Sign In with Apple not enabled" error**
   - Verify Apple Sign-In is enabled in your App ID
   - Check Services ID configuration

4. **"Network error" during OAuth**
   - Check internet connection
   - Verify OAuth provider endpoints are accessible

### Debug Steps

1. Check console logs for detailed error messages
2. Verify OAuth configuration in `src/config/oauth.js`
3. Test OAuth endpoints directly with your backend
4. Check OAuth provider console for any issues

## 📱 Platform-Specific Notes

### Expo Go
- Works on both iOS and Android
- Uses web-based OAuth flows
- No native compilation required
- Supports both Google and Apple Sign-In

### Development vs Production
- **Development**: Use Expo Go for testing
- **Production**: Can use EAS Build for native compilation
- **OAuth**: Same configuration works for both

## 🔄 Updating OAuth Configuration

To update OAuth settings:

1. Modify `src/config/oauth.js`
2. Update OAuth provider console settings
3. Update backend environment variables
4. Test authentication flows

## 🎯 Key Advantages of Expo Go Approach

1. **No Native Compilation**: Works immediately with Expo Go
2. **Cross-Platform**: Same code works on iOS and Android
3. **Easy Testing**: No need for device-specific builds
4. **Rapid Development**: Instant feedback and iteration
5. **Production Ready**: Can be built to native apps later

## 📚 Additional Resources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Go Documentation](https://docs.expo.dev/guides/using-expo-go/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749) 