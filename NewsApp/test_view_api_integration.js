// Test script to verify view API integration
// Run this in the NewsApp directory to test the view tracking

import api, { ENDPOINTS } from './src/services/api';
import * as SecureStore from 'expo-secure-store';

async function testViewTracking() {
  console.log('🧪 Testing view tracking API integration...');
  
  try {
    // Get auth token
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      console.log('❌ No auth token found. Please login first.');
      return;
    }
    
    // Test article ID (you'll need to replace this with a real article ID)
    const testArticleId = 'test-article-id'; // Replace with real article ID
    
    // Test view data
    const viewData = {
      read_time_seconds: 30,
      interaction_strength: 0.8,
      interaction_type: 'test_view',
      category: 'technology',
      source: 'test_source'
    };
    
    console.log('📤 Sending view tracking request...');
    console.log('Article ID:', testArticleId);
    console.log('View data:', viewData);
    
    // Make the API call
    const response = await api.post(ENDPOINTS.ARTICLES.VIEW(testArticleId), viewData);
    
    console.log('✅ View tracking successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ View tracking failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 This is expected if the test article ID doesn\'t exist');
    }
  }
}

// Export for use in other files
export { testViewTracking };

// Run test if this file is executed directly
if (require.main === module) {
  testViewTracking();
} 