# Build Development Client to Fix Native Module Error

The error `'RNGoogleSignin' could not be found` occurs because you're using Expo Go, but `@react-native-google-signin/google-signin` requires a development build.

## 🚨 Quick Fix: Build Development Client

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Build Development Client for iOS
```bash
eas build --profile development --platform ios
```

### 4. Build Development Client for Android
```bash
eas build --profile development --platform android
```

### 5. Install Development Client
- Download the built app from the link provided by EAS
- Install it on your device/simulator

### 6. Start Development Server
```bash
expo start --dev-client
```

## 🎯 Why This Works

- ✅ **Native modules work** in development builds
- ✅ **Google Sign-In SDK** is properly linked
- ✅ **No more "RNGoogleSignin not found"** error
- ✅ **Follows Supabase docs** exactly

## 📱 Alternative: Use Expo AuthSession

If you prefer to stay with Expo Go, you can use Expo's AuthSession instead:

```bash
npx expo install expo-auth-session expo-crypto
```

But the native approach (above) is recommended as it follows the Supabase documentation exactly.

## 🚀 Next Steps

1. **Build development client** (recommended)
2. **Test Google Sign-In**
3. **Remove debug components**
4. **Deploy to production**

The development build approach is the **official Supabase recommendation** for React Native with Expo! 