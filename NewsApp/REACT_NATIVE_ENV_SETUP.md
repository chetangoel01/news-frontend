# React Native Environment Variables Setup

This guide explains how to properly handle environment variables in React Native apps, especially for Supabase configuration.

## 🎯 The Problem with React Native Environment Variables

### **Why .env files don't work in React Native:**
- React Native bundles are **static** (built once, distributed)
- `.env` files are **not included** in the final app bundle
- Environment variables need to be **embedded at build time**
- The app runs on **client devices**, not your server

### **The Solution:**
Use **Expo Constants** or **build-time configuration** to embed values in the app bundle.

## 🚀 Recommended Approach: Expo Constants

### **Step 1: Configure app.json**

Add your Supabase credentials to `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://fdtupnezbxurutavplfh.supabase.co",
      "supabaseAnonKey": "your-actual-anon-key-here"
    }
  }
}
```

### **Step 2: Access in your app**

```javascript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;
```

## 🔧 Alternative Approaches

### **Option 1: Build-time Configuration (Recommended for Production)**

Create a config file that gets updated during your build process:

```javascript
// src/config/buildConfig.js
export const BUILD_CONFIG = {
  supabaseUrl: 'https://fdtupnezbxurutavplfh.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
};
```

### **Option 2: Development vs Production**

```javascript
// src/config/supabase.js
const isDevelopment = __DEV__;

const getSupabaseConfig = () => {
  if (isDevelopment) {
    // Use .env in development
    return {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    };
  } else {
    // Use hardcoded values in production
    return {
      url: 'https://fdtupnezbxurutavplfh.supabase.co',
      anonKey: 'your-production-anon-key',
    };
  }
};
```

### **Option 3: Remote Configuration**

Use a remote config service (Firebase Remote Config, etc.) to update values without rebuilding:

```javascript
// Fetch config from your server
const fetchConfig = async () => {
  const response = await fetch('https://your-api.com/config');
  return response.json();
};
```

## 📱 Current Implementation

The current `src/config/supabase.js` uses a **multi-source approach**:

1. **Expo Constants** (primary)
2. **Process.env** (development)
3. **Hardcoded fallback** (production)

This ensures the app works in all scenarios.

## 🔐 Security Considerations

### **What's Safe to Include:**
- ✅ **Public anon keys** (designed to be public)
- ✅ **API URLs** (public endpoints)
- ✅ **App configuration** (non-sensitive)

### **What's NOT Safe:**
- ❌ **Service role keys** (admin access)
- ❌ **Database passwords**
- ❌ **JWT secrets**

### **For Supabase Specifically:**
- ✅ **Anon key** = Safe to include (public)
- ✅ **Project URL** = Safe to include (public)
- ❌ **Service role key** = Never include (admin access)

## 🛠️ Setup Instructions

### **For Development:**

1. **Create a .env file** (for development only):
   ```
   SUPABASE_URL=https://fdtupnezbxurutavplfh.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Update app.json** with your actual anon key:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "https://fdtupnezbxurutavplfh.supabase.co",
         "supabaseAnonKey": "your-actual-anon-key-here"
       }
     }
   }
   ```

### **For Production:**

1. **Get your anon key** from Supabase dashboard
2. **Update app.json** with the real anon key
3. **Build the app** - values are embedded in the bundle

## 🧪 Testing Your Configuration

```javascript
// Test your configuration
import { getConfigInfo } from '../config/supabase';

const configInfo = getConfigInfo();
console.log('Config source:', configInfo.source);
console.log('URL configured:', !!configInfo.url);
console.log('Anon key configured:', configInfo.anonKeyConfigured);
```

## 🎯 Benefits of This Approach

- ✅ **Works in production** - values embedded in bundle
- ✅ **Secure** - only public keys included
- ✅ **Flexible** - multiple fallback sources
- ✅ **Expo compatible** - works with Expo Go
- ✅ **Cross-platform** - same code for iOS/Android

## 📚 Next Steps

1. **Get your Supabase anon key** from the dashboard
2. **Update app.json** with the real anon key
3. **Test the configuration**
4. **Build and test** the OAuth flow

This approach ensures your React Native app will work properly in both development and production environments! 