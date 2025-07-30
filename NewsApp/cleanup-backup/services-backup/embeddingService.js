import api, { ENDPOINTS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalDatabase from './localDatabase';

class EmbeddingService {
  constructor() {
    this.sessionStart = null;
    this.lastUpdateTime = null;
    this.articlesProcessed = 0;
    this.settings = null;
    this.isInitialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.settings = await LocalDatabase.getSettings();
      this.lastUpdateTime = await AsyncStorage.getItem('last_embedding_update');
      this.isInitialized = true;
      console.log('Embedding service initialized');
    } catch (error) {
      console.error('Initialize embedding service error:', error);
    }
  }

  // Initialize session
  async startSession() {
    await this.initialize();
    this.sessionStart = new Date().toISOString();
    this.articlesProcessed = 0;
    console.log('Embedding session started');
  }

  // Add interaction to local storage
  async addInteraction(interaction) {
    await this.initialize();
    
    // Store interaction locally
    await LocalDatabase.storeInteraction(interaction);
    
    this.articlesProcessed++;
    
    // Check if we should trigger an update
    if (this.articlesProcessed >= this.settings.updateFrequency) {
      await this.triggerUpdate();
    }
  }

  // Track article view (stored locally only)
  async trackArticleView(articleId, viewData = {}) {
    const interaction = {
      type: 'view',
      articleId,
      ...viewData,
    };
    
    await this.addInteraction(interaction);
  }

  // Track like action (stored locally + sent to server)
  async trackLike(articleId, articleData = {}) {
    const interaction = {
      type: 'like',
      articleId,
      ...articleData,
    };
    
    // Store locally
    await this.addInteraction(interaction);
    
    // Also send to server for immediate feedback
    try {
      await api.post(ENDPOINTS.ARTICLES.LIKE(articleId));
    } catch (error) {
      console.error('Send like to server error:', error);
    }
  }

  // Track dislike/skip action (stored locally only)
  async trackDislike(articleId, articleData = {}) {
    const interaction = {
      type: 'dislike',
      articleId,
      ...articleData,
    };
    
    await this.addInteraction(interaction);
  }

  // Track bookmark action (stored locally + sent to server)
  async trackBookmark(articleId, articleData = {}) {
    const interaction = {
      type: 'bookmark',
      articleId,
      ...articleData,
    };
    
    // Store locally
    await this.addInteraction(interaction);
    
    // Also send to server for immediate feedback
    try {
      await api.post(ENDPOINTS.ARTICLES.BOOKMARK(articleId));
    } catch (error) {
      console.error('Send bookmark to server error:', error);
    }
  }

  // Track share action (stored locally + sent to server)
  async trackShare(articleId, platform, articleData = {}) {
    const interaction = {
      type: 'share',
      articleId,
      platform,
      ...articleData,
    };
    
    // Store locally
    await this.addInteraction(interaction);
    
    // Also send to server for immediate feedback
    try {
      await api.post(ENDPOINTS.ARTICLES.SHARE(articleId), { 
        platform 
      });
    } catch (error) {
      console.error('Send share to server error:', error);
    }
  }

  // Compute local embedding vector using stored interactions
  async computeLocalEmbedding() {
    try {
      const interactions = await LocalDatabase.getInteractions();
      
      // This is a simplified embedding computation
      // In production, you would use a lightweight model like all-MiniLM-L6-v2
      const embedding = new Array(384).fill(0);
      
      // Simple feature extraction based on interactions
      const categoryWeights = {};
      const sourceWeights = {};
      let totalInteractions = interactions.length;
      
      interactions.forEach(interaction => {
        // Extract features from interaction
        if (interaction.category) {
          categoryWeights[interaction.category] = (categoryWeights[interaction.category] || 0) + 1;
        }
        
        if (interaction.source) {
          sourceWeights[interaction.source] = (sourceWeights[interaction.source] || 0) + 1;
        }
        
        // Weight positive interactions more heavily
        const weight = interaction.type === 'like' ? 2 : 
                      interaction.type === 'bookmark' ? 1.5 :
                      interaction.type === 'share' ? 1.8 :
                      interaction.type === 'dislike' ? -1 : 1;
        
        // Apply weights to embedding dimensions (simplified)
        const categoryHash = this.hashString(interaction.category || 'general');
        const sourceHash = this.hashString(interaction.source || 'unknown');
        
        embedding[categoryHash % 384] += weight * 0.1;
        embedding[sourceHash % 384] += weight * 0.05;
      });
      
      // Normalize embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      if (magnitude > 0) {
        embedding.forEach((val, i) => {
          embedding[i] = val / magnitude;
        });
      }
      
      return embedding;
    } catch (error) {
      console.error('Compute embedding error:', error);
      // Return default embedding
      return new Array(384).fill(0);
    }
  }

  // Hash string to number (simple implementation)
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Generate interaction summary from local data
  async generateInteractionSummary() {
    try {
      const interactions = await LocalDatabase.getInteractions();
      const stats = await LocalDatabase.getInteractionStats();
      
      const summary = {
        articles_processed: this.articlesProcessed,
        session_start: this.sessionStart,
        session_end: new Date().toISOString(),
        avg_read_time_seconds: 0,
        engagement_metrics: {
          liked_articles: stats.byType.like || 0,
          shared_articles: stats.byType.share || 0,
          bookmarked_articles: stats.byType.bookmark || 0,
          skipped_articles: stats.byType.dislike || 0,
        },
        category_exposure: stats.byCategory,
        device_type: 'mobile',
        app_version: '1.0.0',
      };

      // Calculate average read time from view interactions
      const viewInteractions = interactions.filter(i => i.type === 'view');
      let totalReadTime = 0;
      let readTimeCount = 0;

      viewInteractions.forEach(interaction => {
        if (interaction.view_duration_seconds) {
          totalReadTime += interaction.view_duration_seconds;
          readTimeCount++;
        }
      });

      if (readTimeCount > 0) {
        summary.avg_read_time_seconds = totalReadTime / readTimeCount;
      }

      return summary;
    } catch (error) {
      console.error('Generate interaction summary error:', error);
      return {
        articles_processed: 0,
        session_start: this.sessionStart,
        session_end: new Date().toISOString(),
        avg_read_time_seconds: 0,
        engagement_metrics: {
          liked_articles: 0,
          shared_articles: 0,
          bookmarked_articles: 0,
          skipped_articles: 0,
        },
        category_exposure: {},
        device_type: 'mobile',
        app_version: '1.0.0',
      };
    }
  }

  // Trigger embedding update to server
  async triggerUpdate() {
    try {
      if (this.articlesProcessed === 0) {
        return;
      }

      console.log(`Triggering embedding update with ${this.articlesProcessed} articles processed`);

      const embedding = await this.computeLocalEmbedding();
      const interactionSummary = await this.generateInteractionSummary();

      // Store embedding locally
      await LocalDatabase.storeEmbedding(embedding);

      const updateData = {
        embedding_vector: embedding,
        interaction_summary: interactionSummary,
        session_start: this.sessionStart,
        session_end: new Date().toISOString(),
        articles_processed: this.articlesProcessed,
        device_type: 'mobile',
        app_version: '1.0.0',
      };

      // Send update to backend
      const response = await api.post(ENDPOINTS.USER.EMBEDDING_UPDATE, updateData);
      
      // Store last update time
      this.lastUpdateTime = new Date().toISOString();
      await AsyncStorage.setItem('last_embedding_update', this.lastUpdateTime);

      // Reset session counters
      this.articlesProcessed = 0;

      console.log('Embedding update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Embedding update failed:', error);
      // Don't reset counters on failure, will retry next time
      throw error;
    }
  }

  // Force update (for manual triggers)
  async forceUpdate() {
    return this.triggerUpdate();
  }

  // Get embedding status
  async getEmbeddingStatus() {
    try {
      const response = await api.get(ENDPOINTS.USER.EMBEDDING_STATUS);
      return response.data;
    } catch (error) {
      console.error('Get embedding status error:', error);
      return null;
    }
  }

  // Get local embedding status
  async getLocalStatus() {
    try {
      const stats = await LocalDatabase.getInteractionStats();
      const settings = await LocalDatabase.getSettings();
      
      return {
        last_updated: this.lastUpdateTime,
        articles_since_update: this.articlesProcessed,
        sync_required: this.articlesProcessed >= settings.updateFrequency,
        buffer_size: stats.total,
        session_active: !!this.sessionStart,
        local_interactions: stats.total,
        recent_activity: stats.recentActivity,
      };
    } catch (error) {
      console.error('Get local status error:', error);
      return null;
    }
  }

  // End session and force final update
  async endSession() {
    try {
      if (this.articlesProcessed > 0) {
        await this.triggerUpdate();
      }
      
      this.sessionStart = null;
      this.articlesProcessed = 0;
      
      console.log('Embedding session ended');
    } catch (error) {
      console.error('End session error:', error);
    }
  }

  // Get interaction statistics
  async getInteractionStats() {
    return await LocalDatabase.getInteractionStats();
  }

  // Update settings
  async updateSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await LocalDatabase.storeSettings(this.settings);
      return true;
    } catch (error) {
      console.error('Update settings error:', error);
      return false;
    }
  }

  // Clear old interactions
  async clearOldInteractions(daysToKeep = 30) {
    return await LocalDatabase.clearOldInteractions(daysToKeep);
  }

  // Export data for backup
  async exportData() {
    return await LocalDatabase.exportData();
  }

  // Import data from backup
  async importData(data) {
    return await LocalDatabase.importData(data);
  }

  // Clear all data (for testing or reset)
  async clearData() {
    try {
      await LocalDatabase.clearAllData();
      this.sessionStart = null;
      this.lastUpdateTime = null;
      this.articlesProcessed = 0;
      
      console.log('Embedding data cleared');
    } catch (error) {
      console.error('Clear data error:', error);
    }
  }
}

export default new EmbeddingService(); 