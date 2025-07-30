import React, { createContext, useContext, useState, useCallback } from 'react';
import articleService from '../services/articleService';
import embeddingService from '../services/embeddingService';

const ArticleContext = createContext();

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};

export const ArticleProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadArticles = useCallback(async (forceRefresh = false) => {
    try {
      // Check if we should use cached data (only for initial load, not for pagination)
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTime;
      const isPagination = !forceRefresh && nextCursor !== null;
      const shouldUseCache = !forceRefresh && !isPagination && articles.length > 0 && timeSinceLastLoad < 5 * 60 * 1000;
      
      console.log('📱 LoadArticles called:', { forceRefresh, isPagination, nextCursor, shouldUseCache, timeSinceLastLoad: Math.round(timeSinceLastLoad / 1000) });
      
      if (shouldUseCache) {
        console.log('📱 Using cached articles (loaded', Math.round(timeSinceLastLoad / 1000), 'seconds ago)');
        return;
      }

      // Don't load more if we don't have more articles and it's not a force refresh
      // But allow pagination even if hasMore is false, as the server might have more articles
      if (!forceRefresh && !hasMore && articles.length > 0 && nextCursor === null) {
        console.log('📱 No more articles available (no cursor)');
        return;
      }

      if (forceRefresh) {
        setRefreshing(true);
        setNextCursor(null);
        setHasMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Start embedding session
      embeddingService.startSession();
      
      const response = await articleService.getPersonalizedFeed({ 
        limit: 50, // Load 50 articles initially
        refresh: forceRefresh,
        cursor: forceRefresh ? null : nextCursor,
        force_fresh: forceRefresh  // Pass force_fresh when user requests fresh content
      });
      console.log('📱 API Response articles:', response.articles.length, 'articles');
      console.log('📱 First article sample:', response.articles[0]);
      
      const transformedArticles = await Promise.all(response.articles.map(async article => 
        await articleService.transformArticle(article)
      ));
      
      console.log('📱 Transformed articles:', transformedArticles.length, 'articles');
      console.log('📱 First transformed article sample:', transformedArticles[0]);
      
      if (forceRefresh) {
        // Replace articles on force refresh
        setArticles(transformedArticles);
      } else {
        // Append new articles to existing ones, avoiding duplicates
        setArticles(prevArticles => {
          const existingIds = new Set(prevArticles.map(article => article.id));
          console.log('📱 Existing article IDs:', Array.from(existingIds).slice(0, 5));
          console.log('📱 New article IDs:', transformedArticles.map(a => a.id).slice(0, 5));
          
          const newArticles = transformedArticles.filter(article => !existingIds.has(article.id));
          console.log('📱 Appending', newArticles.length, 'new articles to', prevArticles.length, 'existing articles');
          
          if (newArticles.length === 0) {
            console.log('📱 All new articles were filtered out as duplicates!');
            console.log('📱 First few existing IDs:', Array.from(existingIds).slice(0, 10));
            console.log('📱 First few new IDs:', transformedArticles.map(a => a.id).slice(0, 10));
          }
          
          return [...prevArticles, ...newArticles];
        });
      }
      
      // Update pagination state
      setNextCursor(response.next_cursor || null);
      setHasMore(response.has_more || false);
      setLastLoadTime(now);
      console.log('📱 Loaded', transformedArticles.length, 'articles from API. Has more:', response.has_more);
      console.log('📱 Total articles now:', articles.length + transformedArticles.length);
      console.log('📱 Next cursor:', response.next_cursor);
    } catch (err) {
      console.error('Failed to load articles:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [articles.length, lastLoadTime, nextCursor, hasMore]); // Add dependencies for proper updates

  const updateArticleEngagement = (articleId, engagement) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === articleId
          ? { ...article, engagement: { ...article.engagement, ...engagement } }
          : article
      )
    );
  };

  // Check if we need to load more articles (when 25 or fewer articles remain)
  // This ensures smooth scrolling with 50 articles loaded initially
  const checkAndLoadMoreArticles = useCallback(async () => {
    if (articles.length <= 25 && hasMore && !loading && !refreshing) {
      console.log('📱 Auto-loading more articles (25 or fewer remaining)');
      await loadArticles(false);
    }
  }, [articles.length, hasMore, loading, refreshing, loadArticles]);

  const value = {
    articles,
    loading,
    refreshing,
    error,
    lastLoadTime,
    nextCursor,
    hasMore,
    loadArticles,
    setError,
    updateArticleEngagement,
    checkAndLoadMoreArticles,
  };

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
}; 