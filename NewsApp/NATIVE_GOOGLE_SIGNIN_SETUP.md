# Native Google Sign-In Setup with Expo

This guide follows the **exact Supabase documentation** for React Native with Expo.

## 🚨 Important: Development Build Required

The `@react-native-google-signin/google-signin` package requires a **development build** because it's a native module. You cannot use Expo Go.

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install @react-native-google-signin/google-signin
```

### 2. Configure Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Select your project

2. **Enable Google Sign-In API:**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Sign-In API"
   - Enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client IDs**
   - Create credentials for:
     - **Web application** (for Supabase)
     - **iOS application** (for your app)
     - **Android application** (for your app)

### 3. Configure Supabase

1. **In Supabase Dashboard:**
   - Go to **Authentication** > **Providers**
   - Enable **Google** provider
   - Add your **Web Client ID** and **Web Client Secret**

2. **Set redirect URIs in Google Cloud Console:**
   ```
   https://fdtupnezbxurutavplfh.supabase.co/auth/v1/callback
   ```

### 4. Add Google Services Files

You need to add these files to your project root:

**For iOS (`GoogleService-Info.plist`):**
- Download from Google Cloud Console
- Add to your project root

**For Android (`google-services.json`):**
- Download from Google Cloud Console
- Add to your project root

### 5. Build Development Client

Since this is a native module, you need to build a development client:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build development client for iOS
eas build --profile development --platform ios

# Build development client for Android
eas build --profile development --platform android
```

### 6. Install Development Client

After building, install the development client on your device/simulator.

## 🔧 Implementation Details

### **How it Works (Following Supabase Docs):**

1. **User taps "Continue with Google"**
2. **Native Google Sign-In SDK** opens
3. **Google returns ID token** to your app
4. **App sends ID token to Supabase** using `signInWithIdToken`
5. **Supabase validates token** and creates session
6. **App bridges to your backend** with Supabase session
7. **Backend creates/updates user** and returns tokens

### **Key Features:**

- ✅ **Native Google Sign-In UI** - Better UX
- ✅ **Direct ID token access** - No web OAuth flow
- ✅ **Proper error handling** - Native error codes
- ✅ **Cross-platform** - Same code for iOS/Android
- ✅ **Follows Supabase docs** - Exact implementation

## 📱 Testing

### **Test the Flow:**

1. **Build development client:**
   ```bash
   eas build --profile development --platform ios
   ```

2. **Install development client** on your device

3. **Start development server:**
   ```bash
   expo start --dev-client
   ```

4. **Tap "Continue with Google"**
5. **Complete Google Sign-In**
6. **Check console logs** for success/error messages

### **Expected Behavior:**

- ✅ **Native Google Sign-In UI** appears
- ✅ **No web browser redirect**
- ✅ **ID token received** from Google
- ✅ **Supabase session created**
- ✅ **Backend authentication** successful
- ✅ **Articles load** without 403 errors

## 🚨 Troubleshooting

### **Common Issues:**

1. **"RNGoogleSignin could not be found"**
   - ✅ **Solution**: Build development client (not Expo Go)

2. **"Google Play Services not available"**
   - Install Google Play Services on Android
   - Use Android emulator with Google Play

3. **"Sign-In cancelled"**
   - User cancelled the sign-in flow
   - This is normal behavior

4. **"No ID token received"**
   - Check Google Cloud Console configuration
   - Verify OAuth 2.0 credentials

## 🎯 Benefits

- ✅ **Follows Supabase docs exactly**
- ✅ **Native user experience**
- ✅ **Reliable token handling**
- ✅ **Better error messages**
- ✅ **Cross-platform compatibility**
- ✅ **No PKCE issues**

## 📚 Next Steps

1. **Add Google Services files** to your project
2. **Build development client** with EAS
3. **Test the Google Sign-In flow**
4. **Remove debug components** once working
5. **Deploy to production**

This approach follows the **exact Supabase documentation** and provides the most reliable authentication experience! 