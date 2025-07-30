// Global debug setup for React Native
// This makes debug functions available in the console

import LocalDatabase from './localDatabase';
import embeddingService from './embeddingService';

// Create global debug object
const debugEmbedding = {
  
  // View all local interactions
  async viewInteractions() {
    try {
      const interactions = await LocalDatabase.getInteractions();
      console.log('📊 Local Interactions:', interactions);
      console.log(`📈 Total: ${interactions.length} interactions`);
      
      // Group by type
      const byType = {};
      interactions.forEach(interaction => {
        byType[interaction.type] = (byType[interaction.type] || 0) + 1;
      });
      console.log('📊 By Type:', byType);
      
      return interactions;
    } catch (error) {
      console.error('❌ Error viewing interactions:', error);
      return [];
    }
  },

  // View interaction statistics
  async viewStats() {
    try {
      const stats = await LocalDatabase.getInteractionStats();
      console.log('📈 Interaction Statistics:', stats);
      
      // Pretty print the stats
      console.log('\n📊 Breakdown:');
      console.log(`Total Interactions: ${stats.total}`);
      console.log(`Recent Activity (24h): ${stats.recentActivity}`);
      
      if (stats.byType) {
        console.log('\n📊 By Type:');
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`  ${type}: ${count}`);
        });
      }
      
      if (stats.byCategory) {
        console.log('\n📊 By Category:');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          console.log(`  ${category}: ${count}`);
        });
      }
      
      if (stats.bySource) {
        console.log('\n📊 By Source:');
        Object.entries(stats.bySource).forEach(([source, count]) => {
          console.log(`  ${source}: ${count}`);
        });
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Error viewing stats:', error);
      return null;
    }
  },

  // View current settings
  async viewSettings() {
    try {
      const settings = await LocalDatabase.getSettings();
      console.log('⚙️ Current Settings:', settings);
      
      console.log('\n📋 Settings Breakdown:');
      console.log(`Update Frequency: ${settings.updateFrequency} articles`);
      console.log(`Embedding Model: ${settings.embeddingModel}`);
      console.log(`Privacy Level: ${settings.privacyLevel}`);
      console.log(`Sync Enabled: ${settings.syncEnabled}`);
      
      return settings;
    } catch (error) {
      console.error('❌ Error viewing settings:', error);
      return null;
    }
  },

  // View local embedding status
  async viewStatus() {
    try {
      const status = await embeddingService.getLocalStatus();
      console.log('📱 Local Status:', status);
      
      console.log('\n📋 Status Breakdown:');
      console.log(`Last Updated: ${status.last_updated || 'Never'}`);
      console.log(`Articles Since Update: ${status.articles_since_update}`);
      console.log(`Sync Required: ${status.sync_required ? 'Yes' : 'No'}`);
      console.log(`Session Active: ${status.session_active ? 'Yes' : 'No'}`);
      console.log(`Local Interactions: ${status.local_interactions}`);
      console.log(`Recent Activity: ${status.recent_activity}`);
      
      return status;
    } catch (error) {
      console.error('❌ Error viewing status:', error);
      return null;
    }
  },

  // View stored embedding
  async viewEmbedding() {
    try {
      const embedding = await LocalDatabase.getEmbedding();
      if (embedding) {
        console.log('🧠 Stored Embedding:', embedding);
        console.log(`📏 Vector Length: ${embedding.vector.length}`);
        console.log(`📅 Last Updated: ${embedding.timestamp}`);
        console.log(`🔢 Version: ${embedding.version}`);
        
        // Show some sample values
        const sampleValues = embedding.vector.slice(0, 10);
        console.log('📊 Sample Values (first 10):', sampleValues);
        
        return embedding;
      } else {
        console.log('❌ No embedding stored yet');
        return null;
      }
    } catch (error) {
      console.error('❌ Error viewing embedding:', error);
      return null;
    }
  },

  // Test interaction tracking
  async testTracking() {
    try {
      console.log('🧪 Testing interaction tracking...');
      
      // Test different types of interactions
      await embeddingService.trackArticleView('test-article-1', {
        view_duration_seconds: 30,
        category: 'technology',
        source: 'techcrunch'
      });
      
      await embeddingService.trackLike('test-article-2', {
        category: 'business',
        source: 'reuters'
      });
      
      await embeddingService.trackBookmark('test-article-3', {
        category: 'science',
        source: 'nature'
      });
      
      await embeddingService.trackDislike('test-article-4', {
        category: 'politics',
        source: 'bbc'
      });
      
      console.log('✅ Test interactions tracked successfully');
      
      // Show updated stats
      await this.viewStats();
      
    } catch (error) {
      console.error('❌ Error testing tracking:', error);
    }
  },

  // Compute and view current embedding
  async computeEmbedding() {
    try {
      console.log('🧠 Computing current embedding...');
      
      const embedding = await embeddingService.computeLocalEmbedding();
      console.log('📊 Computed Embedding:', embedding);
      console.log(`📏 Vector Length: ${embedding.length}`);
      
      // Show statistics about the embedding
      const nonZeroCount = embedding.filter(val => val !== 0).length;
      const maxVal = Math.max(...embedding);
      const minVal = Math.min(...embedding);
      const avgVal = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
      
      console.log('\n📈 Embedding Statistics:');
      console.log(`Non-zero values: ${nonZeroCount}/${embedding.length}`);
      console.log(`Max value: ${maxVal}`);
      console.log(`Min value: ${minVal}`);
      console.log(`Average value: ${avgVal}`);
      
      return embedding;
    } catch (error) {
      console.error('❌ Error computing embedding:', error);
      return null;
    }
  },

  // Export all data
  async exportData() {
    try {
      console.log('📤 Exporting all local data...');
      
      const data = await embeddingService.exportData();
      console.log('📊 Exported Data:', data);
      
      // Pretty print the export
      console.log('\n📋 Export Summary:');
      console.log(`Interactions: ${data.interactions?.length || 0}`);
      console.log(`Embedding: ${data.embedding ? 'Present' : 'None'}`);
      console.log(`Settings: ${data.settings ? 'Present' : 'None'}`);
      console.log(`Export Date: ${data.exportDate}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return null;
    }
  },

  // Clear all data
  async clearData() {
    try {
      console.log('🗑️ Clearing all local data...');
      
      const confirmed = confirm('Are you sure you want to clear all local embedding data? This cannot be undone.');
      if (!confirmed) {
        console.log('❌ Operation cancelled');
        return false;
      }
      
      await embeddingService.clearData();
      console.log('✅ All data cleared successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  },

  // Show comprehensive overview
  async overview() {
    try {
      console.log('🔍 Local Embedding System Overview');
      console.log('=====================================');
      
      // Get all information
      const [interactions, stats, settings, status, embedding] = await Promise.all([
        LocalDatabase.getInteractions(),
        LocalDatabase.getInteractionStats(),
        LocalDatabase.getSettings(),
        embeddingService.getLocalStatus(),
        LocalDatabase.getEmbedding()
      ]);
      
      console.log('\n📊 Summary:');
      console.log(`Total Interactions: ${interactions.length}`);
      console.log(`Recent Activity: ${stats.recentActivity}`);
      console.log(`Update Frequency: ${settings.updateFrequency} articles`);
      console.log(`Sync Required: ${status.sync_required ? 'Yes' : 'No'}`);
      console.log(`Embedding Stored: ${embedding ? 'Yes' : 'No'}`);
      
      console.log('\n📋 Quick Actions:');
      console.log('- debugEmbedding.viewInteractions() - View all interactions');
      console.log('- debugEmbedding.viewStats() - View statistics');
      console.log('- debugEmbedding.viewSettings() - View settings');
      console.log('- debugEmbedding.viewStatus() - View status');
      console.log('- debugEmbedding.viewEmbedding() - View stored embedding');
      console.log('- debugEmbedding.testTracking() - Test interaction tracking');
      console.log('- debugEmbedding.computeEmbedding() - Compute current embedding');
      console.log('- debugEmbedding.exportData() - Export all data');
      console.log('- debugEmbedding.clearData() - Clear all data');
      
      return {
        interactions: interactions.length,
        stats,
        settings,
        status,
        embedding: !!embedding
      };
    } catch (error) {
      console.error('❌ Error getting overview:', error);
      return null;
    }
  }
};

// Make it available globally
if (typeof global !== 'undefined') {
  // React Native environment
  global.debugEmbedding = debugEmbedding;
} else if (typeof window !== 'undefined') {
  // Browser environment
  window.debugEmbedding = debugEmbedding;
}

// Also make it available as a global function for easier access
const viewEmbeddingInfo = () => {
  console.log('🔍 Local Embedding Debug Functions Available:');
  console.log('=============================================');
  console.log('debugEmbedding.overview() - Show comprehensive overview');
  console.log('debugEmbedding.viewInteractions() - View all interactions');
  console.log('debugEmbedding.viewStats() - View statistics');
  console.log('debugEmbedding.viewSettings() - View settings');
  console.log('debugEmbedding.viewStatus() - View status');
  console.log('debugEmbedding.viewEmbedding() - View stored embedding');
  console.log('debugEmbedding.testTracking() - Test interaction tracking');
  console.log('debugEmbedding.computeEmbedding() - Compute current embedding');
  console.log('debugEmbedding.exportData() - Export all data');
  console.log('debugEmbedding.clearData() - Clear all data');
  console.log('\n💡 Tip: Call debugEmbedding.overview() for a quick summary');
};

if (typeof global !== 'undefined') {
  global.viewEmbeddingInfo = viewEmbeddingInfo;
} else if (typeof window !== 'undefined') {
  window.viewEmbeddingInfo = viewEmbeddingInfo;
}

// Auto-run overview when loaded
console.log('🔧 Local Embedding Debug Functions Loaded!');
console.log('💡 Call viewEmbeddingInfo() to see available functions');
console.log('💡 Call debugEmbedding.overview() for a quick summary');

export default debugEmbedding; 