import api, { ENDPOINTS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import engagementPersistence from './engagementPersistence';

class ArticleService {
  // Get personalized feed
  async getPersonalizedFeed(params = {}) {
    try {
      const defaultParams = {
        limit: 50,
        refresh: "false",  // FIX: Send as string instead of boolean
        content_type: 'mixed',
        diversify: true,
        force_fresh: false,  // New parameter for fresh content
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      // FIX: Ensure refresh is always a string
      if (typeof queryParams.refresh === 'boolean') {
        queryParams.refresh = queryParams.refresh.toString();
      }
      
      // Convert force_fresh to string if it's a boolean
      if (typeof queryParams.force_fresh === 'boolean') {
        queryParams.force_fresh = queryParams.force_fresh.toString();
      }
      
      const response = await api.get(ENDPOINTS.FEED.PERSONALIZED, { params: queryParams });
      
      // Cache the feed with pagination parameters
      await this.cacheFeed('personalized', response.data, queryParams);
      
      return response.data;
    } catch (error) {
      console.error('Get personalized feed error:', error);
      
      // Return cached feed if available (with pagination parameters)
      const cached = await this.getCachedFeed('personalized', params);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Get trending feed
  async getTrendingFeed(params = {}) {
    try {
      const defaultParams = {
        timeframe: '24h',
        category: null,
        location: null,
      };
      
      const queryParams = { ...defaultParams, ...params };
      const response = await api.get(ENDPOINTS.FEED.TRENDING, { params: queryParams });
      
      // Cache the trending feed
      await this.cacheFeed('trending', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get trending feed error:', error);
      
      // Return cached feed if available
      const cached = await this.getCachedFeed('trending');
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Get articles with filtering
  async getArticles(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 20,
        category: null,
        source: null,
        language: 'en',
        sort: 'recent',
        after_timestamp: null,
      };
      
      const queryParams = { ...defaultParams, ...params };
      const response = await api.get(ENDPOINTS.ARTICLES.LIST, { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('Get articles error:', error);
      throw error;
    }
  }

  // Get article details
  async getArticleDetails(articleId) {
    try {
      const response = await api.get(ENDPOINTS.ARTICLES.DETAIL(articleId));
      
      console.log('📱 ArticleDetails API response:', response.data);
      console.log('📱 ArticleDetails engagement:', response.data.engagement);
      
      // Cache the article details
      await this.cacheArticle(articleId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get article details error:', error);
      
      // Return cached article if available
      const cached = await this.getCachedArticle(articleId);
      if (cached) {
        console.log('📱 Returning cached article:', cached);
        return cached;
      }
      
      throw error;
    }
  }

  async trackArticleView(articleId, viewData = {}) {
    try {
      // This is now handled by the embedding service locally
      const embeddingService = require('./embeddingService').default;
      await embeddingService.trackArticleView(articleId, viewData);
      return { tracked: true, updated_recommendations: false };
    } catch (error) {
      console.error('Track article view error:', error);
      // Don't throw error for tracking failures
      return { tracked: false };
    }
  }

  // Like an article
  async likeArticle(articleId) {
    try {
      const response = await api.post(ENDPOINTS.ARTICLES.LIKE(articleId));
      
      // Update cached article if exists
      await this.updateCachedArticleEngagement(articleId, { liked: true });
      
      // Persist engagement state
      await engagementPersistence.updateEngagementState(articleId, { liked: true });
      
      return response.data;
    } catch (error) {
      console.error('Like article error:', error);
      throw error;
    }
  }

  // Unlike an article
  async unlikeArticle(articleId) {
    try {
      const response = await api.delete(ENDPOINTS.ARTICLES.UNLIKE(articleId));
      
      // Update cached article if exists
      await this.updateCachedArticleEngagement(articleId, { liked: false });
      
      // Persist engagement state
      await engagementPersistence.updateEngagementState(articleId, { liked: false });
      
      return response.data;
    } catch (error) {
      console.error('Unlike article error:', error);
      throw error;
    }
  }

  // Bookmark an article
  async bookmarkArticle(articleId) {
    try {
      const response = await api.post(ENDPOINTS.ARTICLES.BOOKMARK(articleId));
      
      // Update cached article if exists
      await this.updateCachedArticleEngagement(articleId, { bookmarked: true });
      
      // Persist engagement state
      await engagementPersistence.updateEngagementState(articleId, { bookmarked: true });
      
      // Invalidate bookmarks cache since we added a new bookmark
      await this.invalidateBookmarksCache();
      
      return response.data;
    } catch (error) {
      console.error('Bookmark article error:', error);
      throw error;
    }
  }

  // Remove bookmark
  async removeBookmark(articleId) {
    try {
      const response = await api.delete(ENDPOINTS.ARTICLES.BOOKMARK(articleId));
      
      // Update cached article if exists
      await this.updateCachedArticleEngagement(articleId, { bookmarked: false });
      
      // Persist engagement state
      await engagementPersistence.updateEngagementState(articleId, { bookmarked: false });
      
      // Invalidate bookmarks cache since we removed a bookmark
      await this.invalidateBookmarksCache();
      
      return response.data;
    } catch (error) {
      console.error('Remove bookmark error:', error);
      throw error;
    }
  }

  // Share an article
  async shareArticle(articleId, shareData = {}) {
    try {
      const defaultData = {
        platform: 'general',
        message: '',
        include_summary: true,
      };
      
      const data = { ...defaultData, ...shareData };
      const response = await api.post(ENDPOINTS.ARTICLES.SHARE(articleId), data);
      
      return response.data;
    } catch (error) {
      console.error('Share article error:', error);
      throw error;
    }
  }

  // Get similar articles
  async getSimilarArticles(articleId, params = {}) {
    try {
      const defaultParams = {
        limit: 10,
        threshold: 0.7,
      };
      
      const queryParams = { ...defaultParams, ...params };
      const response = await api.get(ENDPOINTS.ARTICLES.SIMILAR(articleId), { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('Get similar articles error:', error);
      throw error;
    }
  }

  // Search articles
  async searchArticles(query, params = {}) {
    try {
      const defaultParams = {
        semantic: true,
        category: null,
        date_range: 'all',
        sort: 'relevance',
        limit: 20,
      };
      
      const queryParams = { q: query, ...defaultParams, ...params };
      const response = await api.get(ENDPOINTS.SEARCH.ARTICLES, { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('Search articles error:', error);
      throw error;
    }
  }

  // Get bookmarks
  async getBookmarks(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 20,
        category: null,
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      // Try to get cached bookmarks first
      const cachedBookmarks = await this.getCachedBookmarks(queryParams);
      if (cachedBookmarks) {
        console.log('📚 Returning cached bookmarks');
        return cachedBookmarks;
      }
      
      // If no cache, fetch from API
      console.log('📚 Fetching bookmarks from API');
      const response = await api.get(ENDPOINTS.BOOKMARKS.LIST, { params: queryParams });
      
      // Cache the bookmarks
      await this.cacheBookmarks(queryParams, response.data);
      
      console.log('Bookmarks API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get bookmarks error:', error);
      
      // Try to return cached bookmarks as fallback
      const cachedBookmarks = await this.getCachedBookmarks(params);
      if (cachedBookmarks) {
        console.log('📚 Returning cached bookmarks as fallback');
        return cachedBookmarks;
      }
      
      throw error;
    }
  }

  // Cache bookmarks
  async cacheBookmarks(params, data) {
    try {
      const key = `bookmarks_${JSON.stringify(params)}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: 15 * 60 * 1000, // 15 minutes for bookmarks
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log('📚 Cached bookmarks with key:', key);
    } catch (error) {
      console.error('Cache bookmarks error:', error);
    }
  }

  // Get cached bookmarks
  async getCachedBookmarks(params) {
    try {
      const key = `bookmarks_${JSON.stringify(params)}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
        
        if (!isExpired) {
          return cacheData.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
          console.log('📚 Removed expired bookmarks cache');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get cached bookmarks error:', error);
      return null;
    }
  }

  // Invalidate bookmarks cache
  async invalidateBookmarksCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const bookmarkKeys = keys.filter(key => key.startsWith('bookmarks_'));
      
      if (bookmarkKeys.length > 0) {
        await AsyncStorage.multiRemove(bookmarkKeys);
        console.log('🗑️ Invalidated bookmarks cache');
      }
    } catch (error) {
      console.error('Invalidate bookmarks cache error:', error);
    }
  }

  // Invalidate personalized feed cache
  async invalidatePersonalizedFeedCache() {
    await this.clearFeedCache('personalized');
  }

  // Cache management methods
  async cacheFeed(type, data, paginationParams = {}) {
    try {
      const key = `feed_${type}_${JSON.stringify(paginationParams)}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000, // 1 hour (increased from 30 minutes)
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`📰 Cached ${type} feed with params:`, paginationParams);
    } catch (error) {
      console.error('Cache feed error:', error);
    }
  }

  async getCachedFeed(type, paginationParams = {}) {
    try {
      const key = `feed_${type}_${JSON.stringify(paginationParams)}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
        
        if (!isExpired) {
          console.log(`📰 Returning cached ${type} feed with params:`, paginationParams);
          return cacheData.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
          console.log(`📰 Removed expired ${type} feed cache with params:`, paginationParams);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get cached feed error:', error);
      return null;
    }
  }

  // Preload critical data for better UX
  async preloadCriticalData() {
    try {
      console.log('🚀 Preloading critical data...');
      
      // Preload personalized feed (initial page)
      try {
        await this.getPersonalizedFeed({ limit: 10, refresh: "false" });
      } catch (error) {
        console.log('Failed to preload personalized feed:', error.message);
      }
      
      // Preload trending feed
      try {
        await this.getTrendingFeed({ limit: 10 });
      } catch (error) {
        console.log('Failed to preload trending feed:', error.message);
      }
      
      // Preload bookmarks
      try {
        await this.getBookmarks({ limit: 10 });
      } catch (error) {
        console.log('Failed to preload bookmarks:', error.message);
      }
      
      console.log('✅ Critical data preloaded');
    } catch (error) {
      console.error('Preload critical data error:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const feedKeys = keys.filter(key => key.startsWith('feed_'));
      const articleKeys = keys.filter(key => key.startsWith('article_'));
      const bookmarkKeys = keys.filter(key => key.startsWith('bookmarks_'));
      
      // Group feed keys by type
      const feedStats = {};
      feedKeys.forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const type = parts[1];
          feedStats[type] = (feedStats[type] || 0) + 1;
        }
      });
      
      return {
        feeds: feedKeys.length,
        feedTypes: feedStats,
        articles: articleKeys.length,
        bookmarks: bookmarkKeys.length,
        total: feedKeys.length + articleKeys.length + bookmarkKeys.length,
      };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return { feeds: 0, feedTypes: {}, articles: 0, bookmarks: 0, total: 0 };
    }
  }

  async cacheArticle(articleId, data) {
    try {
      const key = `article_${articleId}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000, // 1 hour
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache article error:', error);
    }
  }

  async getCachedArticle(articleId) {
    try {
      const key = `article_${articleId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
        
        if (!isExpired) {
          return cacheData.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get cached article error:', error);
      return null;
    }
  }

  async updateCachedArticleEngagement(articleId, engagement) {
    try {
      const key = `article_${articleId}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        cacheData.data.engagement = { ...cacheData.data.engagement, ...engagement };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Update cached article engagement error:', error);
    }
  }

  // Clear all caches
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('feed_') || key.startsWith('article_') || key.startsWith('bookmarks_')
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🗑️ Cleared all caches');
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }

  // Clear specific feed cache
  async clearFeedCache(type) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const feedKeys = keys.filter(key => key.startsWith(`feed_${type}_`));
      
      if (feedKeys.length > 0) {
        await AsyncStorage.multiRemove(feedKeys);
        console.log(`🗑️ Cleared ${feedKeys.length} ${type} feed caches`);
      }
    } catch (error) {
      console.error('Clear feed cache error:', error);
    }
  }

  // Transform API article to app format
  async transformArticle(apiArticle) {
    console.log('📱 Transforming article:', apiArticle.id, apiArticle.title);
    console.log('📱 Article source:', apiArticle.source);
    
    // Load persisted engagement state
    const persistedEngagement = await engagementPersistence.getEngagementState(apiArticle.id);
    
    const transformed = {
      id: apiArticle.id,
      title: apiArticle.title,
      snippet: apiArticle.summary || apiArticle.content_preview,
      imageUrl: apiArticle.image_url,
      author: apiArticle.author,
      publishedAt: this.formatPublishedAt(apiArticle.published_at),
      category: apiArticle.category,
      readTime: `${apiArticle.read_time_minutes || 3} min read`,
      source: apiArticle.source?.name,
      url: apiArticle.url,
      engagement: apiArticle.engagement ? {
        ...apiArticle.engagement,
        liked: persistedEngagement?.liked || apiArticle.engagement.user_liked,
        shared: persistedEngagement?.shared || apiArticle.engagement.user_shared,
        bookmarked: persistedEngagement?.bookmarked || apiArticle.engagement.user_bookmarked,
      } : persistedEngagement || null,
      relevanceScore: apiArticle.relevance_score,
      recommendationReason: apiArticle.recommendation_reason,
      confidenceScore: apiArticle.confidence_score,
    };
    
    console.log('📱 Transformed article:', transformed);
    return transformed;
  }

  // Format published date
  formatPublishedAt(publishedAt) {
    if (!publishedAt) return 'Unknown';
    
    const date = new Date(publishedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export default new ArticleService(); 