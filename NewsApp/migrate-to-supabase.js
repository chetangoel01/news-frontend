#!/usr/bin/env node

/**
 * Migration Script: Manual OAuth to Supabase Auth
 * This script helps you migrate from manual OAuth to Supabase Auth
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Migration: Manual OAuth to Supabase Auth\n');

// Check current setup
console.log('📋 Current Setup Analysis:');
console.log('=' * 50);

// Check if manual OAuth files exist
const manualOAuthFiles = [
  'src/services/oauthService.js',
  'src/config/oauth.js'
];

let hasManualOAuth = false;
manualOAuthFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
    hasManualOAuth = true;
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

// Check if Supabase files exist
const supabaseFiles = [
  'src/services/supabaseAuthService.js',
  'SUPABASE_AUTH_SETUP.md'
];

let hasSupabaseAuth = false;
supabaseFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
    hasSupabaseAuth = true;
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

console.log('\n📊 Migration Status:');
console.log('=' * 50);

if (hasManualOAuth && hasSupabaseAuth) {
  console.log('✅ Both manual OAuth and Supabase Auth files exist');
  console.log('🔄 Ready to migrate from manual OAuth to Supabase Auth');
} else if (hasManualOAuth && !hasSupabaseAuth) {
  console.log('❌ Manual OAuth exists but Supabase Auth files missing');
  console.log('🔧 Need to create Supabase Auth files first');
} else if (!hasManualOAuth && hasSupabaseAuth) {
  console.log('✅ Supabase Auth files exist');
  console.log('🎉 Migration already completed!');
} else {
  console.log('❌ Neither manual OAuth nor Supabase Auth files found');
  console.log('🔧 Need to set up authentication from scratch');
}

console.log('\n🚀 Migration Steps:');
console.log('=' * 50);

console.log('1. 📦 Install Supabase client:');
console.log('   npm install @supabase/supabase-js');
console.log('');

console.log('2. 🔧 Set up Supabase project:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Create new project or use existing');
console.log('   - Get Project URL and anon key from Settings > API');
console.log('');

console.log('3. ⚙️ Configure Google OAuth in Supabase:');
console.log('   - Go to Authentication > Providers');
console.log('   - Enable Google provider');
console.log('   - Add Google OAuth credentials');
console.log('');

console.log('4. 🔄 Update your app configuration:');
console.log('   - Edit src/services/supabaseAuthService.js');
console.log('   - Replace placeholder values with your Supabase credentials');
console.log('');

console.log('5. 📱 Update your auth screens:');
console.log('   - Replace oauthService with supabaseAuthService');
console.log('   - Update import statements');
console.log('   - Test the new auth flow');
console.log('');

console.log('6. 🧹 Clean up (optional):');
console.log('   - Remove old oauthService.js and oauth.js files');
console.log('   - Update any remaining references');
console.log('');

console.log('📚 For detailed instructions, see: SUPABASE_AUTH_SETUP.md');
console.log('');

console.log('🎯 Benefits of this migration:');
console.log('=' * 50);
console.log('✅ No more PKCE errors');
console.log('✅ Simplified OAuth setup');
console.log('✅ Built-in security features');
console.log('✅ Real-time auth state management');
console.log('✅ Multiple OAuth providers');
console.log('✅ Production-ready authentication');
console.log('');

console.log('⏱️ Estimated time: 15-30 minutes');
console.log('🔄 Migration complexity: Low');
console.log('🎉 Result: Much more reliable authentication!'); 