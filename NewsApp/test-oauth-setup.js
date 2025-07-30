#!/usr/bin/env node

/**
 * OAuth Configuration Test Script
 * Run this to check if your OAuth setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking OAuth Configuration...\n');

// Read the OAuth config file
const configPath = path.join(__dirname, 'src/config/oauth.js');
let configContent = '';

try {
  configContent = fs.readFileSync(configPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read OAuth config file:', error.message);
  process.exit(1);
}

// Check for placeholder values
const issues = [];

if (configContent.includes('YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com')) {
  issues.push('❌ Google OAuth Client ID is still using placeholder value');
} else if (configContent.includes('apps.googleusercontent.com')) {
  console.log('✅ Google OAuth Client ID appears to be configured');
} else {
  issues.push('❌ Google OAuth Client ID format is invalid');
}

if (configContent.includes('YOUR_APPLE_SERVICE_ID')) {
  issues.push('❌ Apple OAuth Client ID is still using placeholder value');
} else if (configContent.includes('service.') || configContent.includes('com.')) {
  console.log('✅ Apple OAuth Client ID appears to be configured');
} else {
  console.log('⚠️  Apple OAuth Client ID may not be configured (optional)');
}

console.log('\n📋 Configuration Status:');
if (issues.length === 0) {
  console.log('✅ OAuth configuration appears to be properly set up!');
  console.log('\n🚀 You should now be able to use Google OAuth without the "code_challenge_method" error.');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`  ${issue}`));
  console.log('\n🔧 To fix these issues:');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Create a new OAuth 2.0 Client ID (Web application type)');
  console.log('3. Set authorized redirect URIs for your app');
  console.log('4. Replace the placeholder values in src/config/oauth.js');
}

console.log('\n📖 For detailed setup instructions, see the comments in src/config/oauth.js'); 