// Service exports for easy importing
export { default as embeddingService } from './embeddingService';
export { default as LocalDatabase } from './localDatabase';
export { default as debugEmbedding } from './debugConsole';

// Import debug console to make it available globally
import './debugConsole';

// Re-export for convenience
export const services = {
  embeddingService: require('./embeddingService').default,
  LocalDatabase: require('./localDatabase').default,
  debugEmbedding: require('./debugConsole').default,
};

// Make debug functions available globally in development
if (__DEV__) {
  console.log('🔧 Development mode: Debug functions available');
  console.log('💡 Call viewEmbeddingInfo() to see available functions');
  console.log('💡 Call debugEmbedding.overview() for a quick summary');
} 