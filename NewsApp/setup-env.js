#!/usr/bin/env node

/**
 * Environment Setup Script for React Native + Supabase
 * This script helps you set up environment variables for Supabase Auth
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for Supabase Auth\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if Supabase variables are configured
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=');
  const hasSupabaseAnonKey = envContent.includes('SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseAnonKey) {
    console.log('✅ Supabase environment variables are configured');
  } else {
    console.log('⚠️  Supabase environment variables need to be added');
  }
} else {
  console.log('❌ .env file not found');
}

console.log('\n📋 Environment Variables Setup:');
console.log('=' * 50);

console.log('1. Create a .env file in the NewsApp directory:');
console.log('   touch .env');
console.log('');

console.log('2. Add the following variables to your .env file:');
console.log('');
console.log('   # Supabase Configuration');
console.log('   SUPABASE_URL=https://fdtupnezbxurutavplfh.supabase.co');
console.log('   SUPABASE_ANON_KEY=your-anon-key-here');
console.log('');
console.log('   # Expo Public Variables (for Expo Go compatibility)');
console.log('   EXPO_PUBLIC_SUPABASE_URL=https://fdtupnezbxurutavplfh.supabase.co');
console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
console.log('');

console.log('3. Get your Supabase anon key:');
console.log('   - Go to: https://supabase.com/dashboard');
console.log('   - Select your project (fdtupnezbxurutavplfh)');
console.log('   - Go to Settings > API');
console.log('   - Copy the "anon public" key');
console.log('   - Replace "your-anon-key-here" with the actual key');
console.log('');

console.log('4. Install react-native-dotenv (if not already installed):');
console.log('   npm install react-native-dotenv');
console.log('');

console.log('5. Update babel.config.js to support .env files:');
console.log('   Add this to your babel.config.js:');
console.log('   module.exports = {');
console.log('     presets: ["babel-preset-expo"],');
console.log('     plugins: [');
console.log('       ["module:react-native-dotenv", {');
console.log('         moduleName: "@env",');
console.log('         path: ".env",');
console.log('       }]');
console.log('     ]');
console.log('   };');
console.log('');

console.log('6. Update your config to import from @env:');
console.log('   import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";');
console.log('');

console.log('🎯 Benefits of this approach:');
console.log('=' * 50);
console.log('✅ Environment variables are properly managed');
console.log('✅ No hardcoded credentials in code');
console.log('✅ Easy to switch between environments');
console.log('✅ Secure credential management');
console.log('✅ Follows React Native best practices');
console.log('');

console.log('📚 Next steps:');
console.log('1. Create the .env file with your Supabase credentials');
console.log('2. Update babel.config.js to support .env');
console.log('3. Update src/config/supabase.js to import from @env');
console.log('4. Test the configuration');
console.log('');

console.log('🔍 To test your configuration:');
console.log('   node src/config/supabase.js'); 