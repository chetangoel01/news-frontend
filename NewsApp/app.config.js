// Dynamic Expo App Configuration
// This file allows you to configure environment-specific values

export default {
  expo: {
    name: "NewsApp",
    slug: "NewsApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "newsapp",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.chetan01.newsapp",
      buildNumber: "1",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.chetan01.newsapp"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    entryPoint: "./index.js",
    plugins: [
      "expo-secure-store",
      "expo-image-picker"
    ],
    extra: {
      // EAS project configuration
      eas: {
        projectId: "598fb8dc-901d-4210-9ad6-239aa6286f92"
      },
      // Supabase configuration - will be populated from environment variables
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      // API configuration - will be populated from environment variables
      apiUrl: process.env.API_URL || 'https://newsapp.dragonchetan.com',
    },
  },
}; 