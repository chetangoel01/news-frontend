import AsyncStorage from '@react-native-async-storage/async-storage';

class EngagementPersistenceService {
  constructor() {
    this.engagementKey = 'user_engagement_states';
  }

  // Save engagement state for an article
  async saveEngagementState(articleId, engagement) {
    try {
      const key = `${this.engagementKey}_${articleId}`;
      const data = {
        ...engagement,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log('💾 Saved engagement state for article:', articleId, engagement);
    } catch (error) {
      console.error('Save engagement state error:', error);
    }
  }

  // Get engagement state for an article
  async getEngagementState(articleId) {
    try {
      const key = `${this.engagementKey}_${articleId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        // Check if data is not too old (30 days)
        const isExpired = Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
          console.log('💾 Retrieved engagement state for article:', articleId, data);
          return data;
        } else {
          // Remove expired data
          await AsyncStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get engagement state error:', error);
      return null;
    }
  }

  // Update engagement state for an article
  async updateEngagementState(articleId, updates) {
    try {
      const existing = await this.getEngagementState(articleId) || {};
      const updated = { ...existing, ...updates, timestamp: Date.now() };
      await this.saveEngagementState(articleId, updated);
      console.log('💾 Updated engagement state for article:', articleId, updated);
    } catch (error) {
      console.error('Update engagement state error:', error);
    }
  }

  // Clear all engagement states
  async clearAllEngagementStates() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const engagementKeys = keys.filter(key => key.startsWith(this.engagementKey));
      
      if (engagementKeys.length > 0) {
        await AsyncStorage.multiRemove(engagementKeys);
        console.log('🗑️ Cleared all engagement states');
      }
    } catch (error) {
      console.error('Clear engagement states error:', error);
    }
  }

  // Get all engagement states
  async getAllEngagementStates() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const engagementKeys = keys.filter(key => key.startsWith(this.engagementKey));
      
      const states = {};
      for (const key of engagementKeys) {
        const articleId = key.replace(`${this.engagementKey}_`, '');
        const state = await this.getEngagementState(articleId);
        if (state) {
          states[articleId] = state;
        }
      }
      
      return states;
    } catch (error) {
      console.error('Get all engagement states error:', error);
      return {};
    }
  }
}

export default new EngagementPersistenceService(); 