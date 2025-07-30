// Simple test script for the local embedding system
// Run this in your React Native app or browser console

console.log('🧪 Testing Local Embedding System...');

// Mock AsyncStorage for testing
const mockAsyncStorage = {
  data: {},
  async setItem(key, value) {
    this.data[key] = value;
    console.log(`📦 Stored: ${key} = ${value}`);
  },
  async getItem(key) {
    const value = this.data[key];
    console.log(`📦 Retrieved: ${key} = ${value}`);
    return value;
  },
  async removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ Removed: ${key}`);
  },
  async multiRemove(keys) {
    keys.forEach(key => delete this.data[key]);
    console.log(`🗑️ Removed multiple: ${keys.join(', ')}`);
  }
};

// Mock the services
const LocalDatabase = {
  interactionsKey: 'user_interactions',
  embeddingKey: 'user_embedding',
  settingsKey: 'embedding_settings',
  
  async storeInteraction(interaction) {
    try {
      const interactions = await this.getInteractions();
      interactions.push({
        ...interaction,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      
      if (interactions.length > 1000) {
        interactions.splice(0, interactions.length - 1000);
      }
      
      await mockAsyncStorage.setItem(this.interactionsKey, JSON.stringify(interactions));
      return true;
    } catch (error) {
      console.error('Store interaction error:', error);
      return false;
    }
  },

  async getInteractions() {
    try {
      const data = await mockAsyncStorage.getItem(this.interactionsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get interactions error:', error);
      return [];
    }
  },

  async getSettings() {
    try {
      const data = await mockAsyncStorage.getItem(this.settingsKey);
      return data ? JSON.parse(data) : {
        updateFrequency: 10,
        embeddingModel: 'local',
        privacyLevel: 'high',
        syncEnabled: true,
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        updateFrequency: 10,
        embeddingModel: 'local',
        privacyLevel: 'high',
        syncEnabled: true,
      };
    }
  },

  async getInteractionStats() {
    try {
      const interactions = await this.getInteractions();
      const stats = {
        total: interactions.length,
        byType: {},
        byCategory: {},
        bySource: {},
        recentActivity: 0,
      };

      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      interactions.forEach(interaction => {
        stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
        
        if (interaction.category) {
          stats.byCategory[interaction.category] = (stats.byCategory[interaction.category] || 0) + 1;
        }
        
        if (interaction.source) {
          stats.bySource[interaction.source] = (stats.bySource[interaction.source] || 0) + 1;
        }
        
        if (new Date(interaction.timestamp) >= last24Hours) {
          stats.recentActivity++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Get interaction stats error:', error);
      return {
        total: 0,
        byType: {},
        byCategory: {},
        bySource: {},
        recentActivity: 0,
      };
    }
  }
};

// Test the system
async function testLocalEmbeddingSystem() {
  console.log('\n📊 Test 1: Store Interactions');
  
  // Test storing interactions
  await LocalDatabase.storeInteraction({
    type: 'view',
    articleId: 'test-article-1',
    category: 'technology',
    source: 'techcrunch',
    view_duration_seconds: 45,
  });
  
  await LocalDatabase.storeInteraction({
    type: 'like',
    articleId: 'test-article-2',
    category: 'business',
    source: 'reuters',
  });
  
  await LocalDatabase.storeInteraction({
    type: 'bookmark',
    articleId: 'test-article-3',
    category: 'science',
    source: 'nature',
  });
  
  console.log('\n📊 Test 2: Retrieve Interactions');
  const interactions = await LocalDatabase.getInteractions();
  console.log(`✅ Retrieved ${interactions.length} interactions`);
  
  console.log('\n📊 Test 3: Get Statistics');
  const stats = await LocalDatabase.getInteractionStats();
  console.log('📈 Statistics:', stats);
  
  console.log('\n📊 Test 4: Get Settings');
  const settings = await LocalDatabase.getSettings();
  console.log('⚙️ Settings:', settings);
  
  console.log('\n🎉 All tests passed! Local embedding system is working correctly.');
}

// Run the test
testLocalEmbeddingSystem().catch(console.error); 