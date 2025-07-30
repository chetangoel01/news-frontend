# News App - React Native (Expo)

A modern iOS-style news application built with React Native and Expo, featuring vertical paging, horizontal swipe gestures, beautiful animations, and OAuth authentication.

## Features

- **Vertical Paging**: Full-screen article navigation with smooth scrolling
- **Horizontal Swipe Gestures**: Like/dislike articles with tilt and color feedback
- **Floating Action Pill**: Auto-hiding pill that expands into action buttons
- **Blur Effects**: Native blur using expo-blur
- **Haptic Feedback**: Tactile responses for user interactions using expo-haptics
- **SF Symbols**: Vector icons via react-native-vector-icons
- **Smooth Animations**: Hardware-accelerated animations with React Native Animated API
- **OAuth Authentication**: Google and Apple Sign-In integration
- **Secure Token Management**: JWT tokens with automatic refresh
- **User Profiles**: Personalized user experience with preferences

## Tech Stack

- **Expo**: ~53.0.17
- **React Native**: 0.79.5
- **React**: 19.0.0
- **expo-blur**: Native blur effects
- **expo-haptics**: Tactile feedback
- **react-native-vector-icons**: SF Symbols and other icon sets
- **expo-auth-session**: OAuth authentication flows (Expo Go compatible)
- **expo-crypto**: Secure cryptographic operations
- **expo-web-browser**: Web-based OAuth
- **expo-secure-store**: Secure token storage
- **axios**: HTTP client for API requests

## Project Structure

```
NewsApp/
├── src/
│   ├── screens/
│   │   ├── ArticlePager.js          # Main paging screen
│   │   └── AuthScreen.js            # Authentication screen
│   ├── components/
│   │   ├── ArticleCard.js           # Article card with swipe gestures
│   │   ├── FloatingPill.js          # Expandable action pill
│   │   └── OAuthTestComponent.js    # OAuth testing component
│   ├── services/
│   │   ├── authService.js           # Authentication service
│   │   ├── oauthService.js          # OAuth service (Expo Go compatible)
│   │   └── api.js                   # API client
│   ├── config/
│   │   ├── api.js                   # API configuration
│   │   └── oauth.js                 # OAuth configuration
│   └── assets/
│       └── fonts/                   # Custom fonts (optional)
├── App.js                           # Main app component
├── index.js                         # Entry point
├── app.json                         # Expo configuration
├── OAUTH_SETUP.md                   # OAuth setup guide
└── README.md                        # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)
- Google Cloud Console account (for Google OAuth)
- Apple Developer account (for Apple OAuth)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd NewsApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OAuth (Optional)**
   - Follow the [OAuth Setup Guide](OAUTH_SETUP.md)
   - Update `src/config/oauth.js` with your OAuth client IDs

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## Authentication

### OAuth Providers

The app supports authentication via:
- **Google Sign-In**: Using Google OAuth 2.0 (Expo Go compatible)
- **Apple Sign-In**: Using Apple's Sign In with Apple (Expo Go compatible)
- **Email/Password**: Traditional authentication

### OAuth Flow

1. User taps OAuth button in AuthScreen
2. Expo AuthSession opens web browser for OAuth
3. Provider returns ID token to the app via redirect
4. App sends ID token to backend via `/auth/google` or `/auth/apple`
5. Backend validates token and returns JWT tokens
6. App stores JWT tokens and updates UI

### Security Features

- **Secure Token Storage**: JWT tokens stored using `expo-secure-store`
- **Token Refresh**: Automatic JWT token refresh
- **Nonce Protection**: OAuth requests include cryptographically secure nonces
- **Error Handling**: Comprehensive error handling for all authentication scenarios

## Usage

### Authentication
- **OAuth Sign-In**: Tap "Continue with Google" or "Continue with Apple"
- **Email/Password**: Use traditional login/register form
- **Token Management**: Automatic token refresh and secure storage

### Article Navigation
- **Vertical Swipe**: Swipe up/down to navigate between articles
- **Horizontal Swipe**: Swipe left/right to like/dislike articles
- **Progress Indicator**: The floating pill shows reading progress

### Floating Action Pill
- **Tap to Expand**: Tap the pill to reveal action buttons
- **Auto-hide**: Pill automatically hides during scrolling
- **Actions Available**:
  - Bookmark article
  - Share article
  - Adjust text size
  - View comments

### Gesture Feedback
- **Visual Feedback**: Cards tilt and scale during swipes
- **Color Indicators**: Green for like, red for dislike
- **Haptic Feedback**: Tactile responses for interactions

## Customization

### OAuth Configuration

Update `src/config/oauth.js` with your OAuth client IDs:

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

### Adding New Articles
Edit the `mockArticles` array in `src/screens/ArticlePager.js`:

```javascript
const mockArticles = [
  {
    id: 'unique-id',
    title: 'Article Title',
    snippet: 'Article description...',
    imageUrl: 'https://example.com/image.jpg',
    author: 'Author Name',
    publishedAt: '2 hours ago',
  },
  // ... more articles
];
```

### Styling
- Modify styles in component files
- Update colors, fonts, and spacing
- Customize animation parameters

### Icons
- Replace SF Symbols in `FloatingPill.js`
- Use react-native-vector-icons for custom icons

## Testing

### OAuth Testing

Use the `OAuthTestComponent` for testing OAuth functionality:

```javascript
import OAuthTestComponent from './src/components/OAuthTestComponent';

// Add to your screen for testing
<OAuthTestComponent />
```

### API Testing

The app includes comprehensive API integration with:
- Automatic token management
- Request/response interceptors
- Error handling and retry logic
- Debug logging

## Performance Features

- **Expo Optimizations**: Built-in performance optimizations
- **Native Animations**: Hardware-accelerated animations
- **Optimized Images**: Efficient image loading and caching
- **Memory Management**: Proper cleanup of event listeners
- **Token Caching**: Efficient token storage and retrieval

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   expo start --clear
   ```

2. **Dependencies issues**
   ```bash
   npm install
   expo install
   ```

3. **Cache issues**
   ```bash
   expo start -c
   ```

4. **OAuth configuration issues**
   - Check `src/config/oauth.js` for correct client IDs
   - Verify OAuth provider console settings
   - Check backend environment variables

### Debugging

- Use Expo DevTools for debugging
- Enable React Native Debugger
- Check Metro bundler logs for JavaScript errors
- Monitor OAuth request/response logs in console

## Building for Production

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Expo Classic Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Test OAuth flows
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Expo team for the amazing development platform
- React Native team for the framework
- Apple for SF Pro fonts and SF Symbols design language
- Google and Apple for OAuth authentication services 