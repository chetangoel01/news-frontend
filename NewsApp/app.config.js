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
      bundleIdentifier: "com.newsapp.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.newsapp.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    entryPoint: "./index.js",
    extra: {
      // Supabase configuration
      // These can be overridden by environment variables
      supabaseUrl: process.env.SUPABASE_URL || "https://fdtupnezbxurutavplfh.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",
    },
  },
}; 