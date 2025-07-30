import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalDatabase {
  constructor() {
    this.interactionsKey = 'user_interactions';
    this.embeddingKey = 'user_embedding';
    this.settingsKey = 'embedding_settings';
  }

  // Store interaction locally
  async storeInteraction(interaction) {
    try {
      const interactions = await this.getInteractions();
      interactions.push({
        ...interaction,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 1000 interactions to prevent storage bloat
      if (interactions.length > 1000) {
        interactions.splice(0, interactions.length - 1000);
      }
      
      await AsyncStorage.setItem(this.interactionsKey, JSON.stringify(interactions));
      return true;
    } catch (error) {
      console.error('Store interaction error:', error);
      return false;
    }
  }

  // Get all stored interactions
  async getInteractions() {
    try {
      const data = await AsyncStorage.getItem(this.interactionsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get interactions error:', error);
      return [];
    }
  }

  // Get interactions since a specific date
  async getInteractionsSince(date) {
    try {
      const interactions = await this.getInteractions();
      return interactions.filter(interaction => 
        new Date(interaction.timestamp) >= date
      );
    } catch (error) {
      console.error('Get interactions since error:', error);
      return [];
    }
  }

  // Get interactions for a specific article
  async getInteractionsForArticle(articleId) {
    try {
      const interactions = await this.getInteractions();
      return interactions.filter(interaction => 
        interaction.articleId === articleId
      );
    } catch (error) {
      console.error('Get interactions for article error:', error);
      return [];
    }
  }

  // Store current embedding
  async storeEmbedding(embedding) {
    try {
      const embeddingData = {
        vector: embedding,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      await AsyncStorage.setItem(this.embeddingKey, JSON.stringify(embeddingData));
      return true;
    } catch (error) {
      console.error('Store embedding error:', error);
      return false;
    }
  }

  // Get stored embedding
  async getEmbedding() {
    try {
      const data = await AsyncStorage.getItem(this.embeddingKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get embedding error:', error);
      return null;
    }
  }

  // Store embedding settings
  async storeSettings(settings) {
    try {
      await AsyncStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Store settings error:', error);
      return false;
    }
  }

  // Get embedding settings
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(this.settingsKey);
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
  }

  // Clear old interactions (keep only last N days)
  async clearOldInteractions(daysToKeep = 30) {
    try {
      const interactions = await this.getInteractions();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredInteractions = interactions.filter(interaction =>
        new Date(interaction.timestamp) >= cutoffDate
      );
      
      await AsyncStorage.setItem(this.interactionsKey, JSON.stringify(filteredInteractions));
      return true;
    } catch (error) {
      console.error('Clear old interactions error:', error);
      return false;
    }
  }

  // Get interaction statistics
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
        // Count by type
        stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
        
        // Count by category
        if (interaction.category) {
          stats.byCategory[interaction.category] = (stats.byCategory[interaction.category] || 0) + 1;
        }
        
        // Count by source
        if (interaction.source) {
          stats.bySource[interaction.source] = (stats.bySource[interaction.source] || 0) + 1;
        }
        
        // Count recent activity
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

  // Export data for backup
  async exportData() {
    try {
      const interactions = await this.getInteractions();
      const embedding = await this.getEmbedding();
      const settings = await this.getSettings();
      
      return {
        interactions,
        embedding,
        settings,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Export data error:', error);
      return null;
    }
  }

  // Import data from backup
  async importData(data) {
    try {
      if (data.interactions) {
        await AsyncStorage.setItem(this.interactionsKey, JSON.stringify(data.interactions));
      }
      if (data.embedding) {
        await AsyncStorage.setItem(this.embeddingKey, JSON.stringify(data.embedding));
      }
      if (data.settings) {
        await AsyncStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
      }
      return true;
    } catch (error) {
      console.error('Import data error:', error);
      return false;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        this.interactionsKey,
        this.embeddingKey,
        this.settingsKey,
      ]);
      return true;
    } catch (error) {
      console.error('Clear all data error:', error);
      return false;
    }
  }
}

export default new LocalDatabase(); 