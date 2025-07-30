// Test script for local embedding system
import embeddingService from './embeddingService';
import LocalDatabase from './localDatabase';

class LocalEmbeddingTest {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Local Embedding Tests...');
    
    try {
      await this.testLocalStorage();
      await this.testInteractionTracking();
      await this.testEmbeddingComputation();
      await this.testSettingsManagement();
      await this.testDataExport();
      await this.testCleanup();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testLocalStorage() {
    console.log('📦 Testing Local Storage...');
    
    try {
      // Test storing interactions
      const testInteraction = {
        type: 'view',
        articleId: 'test-article-1',
        category: 'technology',
        source: 'techcrunch',
        view_duration_seconds: 45,
      };
      
      const stored = await LocalDatabase.storeInteraction(testInteraction);
      this.assert(stored, 'Store interaction should succeed');
      
      // Test retrieving interactions
      const interactions = await LocalDatabase.getInteractions();
      this.assert(interactions.length > 0, 'Should retrieve stored interactions');
      
      // Test interaction stats
      const stats = await LocalDatabase.getInteractionStats();
      this.assert(stats.total > 0, 'Should have interaction statistics');
      
      console.log('✅ Local Storage tests passed');
    } catch (error) {
      console.error('❌ Local Storage test failed:', error);
      this.testResults.push({ test: 'Local Storage', passed: false, error });
    }
  }

  async testInteractionTracking() {
    console.log('📊 Testing Interaction Tracking...');
    
    try {
      // Start session
      await embeddingService.startSession();
      
      // Track various interactions
      await embeddingService.trackArticleView('test-article-2', {
        view_duration_seconds: 30,
        category: 'business',
        source: 'reuters'
      });
      
      await embeddingService.trackLike('test-article-3', {
        category: 'technology',
        source: 'wired'
      });
      
      await embeddingService.trackBookmark('test-article-4', {
        category: 'science',
        source: 'nature'
      });
      
      await embeddingService.trackDislike('test-article-5', {
        category: 'politics',
        source: 'bbc'
      });
      
      // Check local status
      const status = await embeddingService.getLocalStatus();
      this.assert(status.articles_since_update > 0, 'Should track articles processed');
      
      console.log('✅ Interaction Tracking tests passed');
    } catch (error) {
      console.error('❌ Interaction Tracking test failed:', error);
      this.testResults.push({ test: 'Interaction Tracking', passed: false, error });
    }
  }

  async testEmbeddingComputation() {
    console.log('🧠 Testing Embedding Computation...');
    
    try {
      // Compute embedding
      const embedding = await embeddingService.computeLocalEmbedding();
      this.assert(Array.isArray(embedding), 'Embedding should be an array');
      this.assert(embedding.length === 384, 'Embedding should be 384-dimensional');
      
      // Check embedding values
      const hasNonZeroValues = embedding.some(val => val !== 0);
      this.assert(hasNonZeroValues, 'Embedding should have non-zero values');
      
      // Test interaction summary
      const summary = await embeddingService.generateInteractionSummary();
      this.assert(summary.articles_processed > 0, 'Should have processed articles');
      this.assert(summary.engagement_metrics, 'Should have engagement metrics');
      
      console.log('✅ Embedding Computation tests passed');
    } catch (error) {
      console.error('❌ Embedding Computation test failed:', error);
      this.testResults.push({ test: 'Embedding Computation', passed: false, error });
    }
  }

  async testSettingsManagement() {
    console.log('⚙️ Testing Settings Management...');
    
    try {
      // Get current settings
      const currentSettings = await embeddingService.getSettings();
      this.assert(currentSettings, 'Should have default settings');
      
      // Update settings
      const newSettings = {
        updateFrequency: 15,
        privacyLevel: 'maximum',
        syncEnabled: false
      };
      
      const updated = await embeddingService.updateSettings(newSettings);
      this.assert(updated, 'Should update settings successfully');
      
      // Verify settings were updated
      const updatedSettings = await embeddingService.getSettings();
      this.assert(updatedSettings.updateFrequency === 15, 'Update frequency should be updated');
      this.assert(updatedSettings.privacyLevel === 'maximum', 'Privacy level should be updated');
      this.assert(updatedSettings.syncEnabled === false, 'Sync enabled should be updated');
      
      console.log('✅ Settings Management tests passed');
    } catch (error) {
      console.error('❌ Settings Management test failed:', error);
      this.testResults.push({ test: 'Settings Management', passed: false, error });
    }
  }

  async testDataExport() {
    console.log('📤 Testing Data Export...');
    
    try {
      // Export data
      const exportedData = await embeddingService.exportData();
      this.assert(exportedData, 'Should export data successfully');
      this.assert(exportedData.interactions, 'Should have interactions in export');
      this.assert(exportedData.settings, 'Should have settings in export');
      this.assert(exportedData.exportDate, 'Should have export date');
      
      // Test data import
      const importSuccess = await embeddingService.importData(exportedData);
      this.assert(importSuccess, 'Should import data successfully');
      
      console.log('✅ Data Export tests passed');
    } catch (error) {
      console.error('❌ Data Export test failed:', error);
      this.testResults.push({ test: 'Data Export', passed: false, error });
    }
  }

  async testCleanup() {
    console.log('🧹 Testing Cleanup...');
    
    try {
      // Test clearing old interactions
      const clearOld = await embeddingService.clearOldInteractions(1); // Keep only 1 day
      this.assert(clearOld, 'Should clear old interactions');
      
      // Test clearing all data
      const clearAll = await embeddingService.clearData();
      this.assert(clearAll === undefined, 'Should clear all data');
      
      // Verify data is cleared
      const interactions = await LocalDatabase.getInteractions();
      this.assert(interactions.length === 0, 'Should have no interactions after clear');
      
      console.log('✅ Cleanup tests passed');
    } catch (error) {
      console.error('❌ Cleanup test failed:', error);
      this.testResults.push({ test: 'Cleanup', passed: false, error });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  printResults() {
    console.log('\n📋 Test Results:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error.message}`);
      }
    });
    
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Local embedding system is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  }
}

// Export test runner
export const runLocalEmbeddingTests = async () => {
  const tester = new LocalEmbeddingTest();
  await tester.runAllTests();
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - don't auto-run
} else {
  // Node.js or React Native environment - auto-run tests
  runLocalEmbeddingTests().catch(console.error);
} 