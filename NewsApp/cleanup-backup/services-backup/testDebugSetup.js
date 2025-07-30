// Test script to verify debug setup is working
// Run this in your React Native console

console.log('🧪 Testing Debug Setup...');

// Check if debug functions are available
if (typeof global !== 'undefined' && global.debugEmbedding) {
  console.log('✅ Debug functions are available globally');
  
  // Test a simple function
  global.debugEmbedding.viewSettings().then(settings => {
    console.log('✅ Settings test passed:', settings);
  }).catch(error => {
    console.error('❌ Settings test failed:', error);
  });
  
} else if (typeof window !== 'undefined' && window.debugEmbedding) {
  console.log('✅ Debug functions are available in browser');
} else {
  console.error('❌ Debug functions not found!');
  console.log('Make sure you imported "./src/services/globalDebug" in your App.js');
}

// Test if viewEmbeddingInfo is available
if (typeof global !== 'undefined' && global.viewEmbeddingInfo) {
  console.log('✅ viewEmbeddingInfo function is available');
  global.viewEmbeddingInfo();
} else if (typeof window !== 'undefined' && window.viewEmbeddingInfo) {
  console.log('✅ viewEmbeddingInfo function is available in browser');
  window.viewEmbeddingInfo();
} else {
  console.error('❌ viewEmbeddingInfo function not found!');
}

console.log('🔧 Debug setup test complete!');
console.log('💡 Try calling: debugEmbedding.overview()'); 