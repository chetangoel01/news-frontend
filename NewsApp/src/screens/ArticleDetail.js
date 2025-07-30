import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useArticles } from '../context/ArticleContext';
import articleService from '../services/articleService';
import embeddingService from '../services/embeddingService';
import engagementPersistence from '../services/engagementPersistence';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ArticleDetail = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { article } = route.params;
  const { updateArticleEngagement } = useArticles();
  
  console.log('📱 ArticleDetail - Received article:', {
    id: article.id,
    title: article.title,
    engagement: article.engagement,
    isBookmarked: article.isBookmarked
  });
  
  const [fullArticle, setFullArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const initialBookmarkState = article.engagement?.bookmarked || article.isBookmarked || false;
  const initialLikeState = article.engagement?.liked || article.isLiked || false;
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);
  const [isLiked, setIsLiked] = useState(initialLikeState);
  
  console.log('📱 ArticleDetail - Initial bookmark state:', initialBookmarkState);
  console.log('📱 ArticleDetail - Initial like state:', initialLikeState);

  // Load full article details and engagement state
  useEffect(() => {
    const loadArticleDetails = async () => {
      try {
        setLoading(true);
        
        // Load persisted engagement state first
        const persistedEngagement = await engagementPersistence.getEngagementState(article.id);
        console.log('📱 ArticleDetail - Persisted engagement:', persistedEngagement);
        
        const details = await articleService.getArticleDetails(article.id);
        
        // Merge engagement states: passed article > persisted > server response
        const mergedEngagement = {
          liked: article.engagement?.liked || article.isLiked || persistedEngagement?.liked || details.engagement?.liked || false,
          bookmarked: article.engagement?.bookmarked || article.isBookmarked || persistedEngagement?.bookmarked || details.engagement?.bookmarked || false,
          shared: article.engagement?.shared || persistedEngagement?.shared || details.engagement?.shared || false,
        };
        
        const detailsWithEngagement = {
          ...details,
          engagement: {
            ...details.engagement,
            ...mergedEngagement,
          }
        };
        
        // Update local state to reflect the merged engagement
        setIsLiked(mergedEngagement.liked);
        setIsBookmarked(mergedEngagement.bookmarked);
        
        // Save the merged engagement state
        await engagementPersistence.saveEngagementState(article.id, mergedEngagement);
        
        console.log('📱 ArticleDetail - Merged engagement state:', detailsWithEngagement.engagement);
        setFullArticle(detailsWithEngagement);
      } catch (err) {
        console.error('Failed to load article details:', err);
        setError('Failed to load article details');
      } finally {
        setLoading(false);
      }
    };

    loadArticleDetails();
  }, [article.id, article.engagement, article.isLiked, article.isBookmarked]);

  useEffect(() => {
    return () => {
      const readingTime = Math.floor((Date.now() - startTime) / 1000);
      if (readingTime > 5) { // Only track if they spent more than 5 seconds
        const percentageRead = Math.round(Math.min(readingTime / 60 * 100, 100));
        const viewData = {
          view_duration_seconds: readingTime,
          percentage_read: percentageRead,
          interaction_type: 'read_article',
          swipe_direction: 'none',
          category: article.category || 'general',
          source: article.source?.name || 'unknown',
        };
        
        articleService.trackArticleView(article.id, viewData);
        embeddingService.trackArticleView(article.id, viewData);
      }
    };
  }, [article.id, article.category, article.source?.name, startTime]);

  const handleBookmark = async () => {
    const originalBookmarkState = isBookmarked;
    const newBookmarkState = !originalBookmarkState;
    
    setIsBookmarked(newBookmarkState);
    updateArticleEngagement(article.id, { bookmarked: newBookmarkState });

    try {
      if (originalBookmarkState) {
        await articleService.removeBookmark(article.id);
      } else {
        await articleService.bookmarkArticle(article.id);
      }
      
      // Persist the engagement state change
      await engagementPersistence.updateEngagementState(article.id, { bookmarked: newBookmarkState });
    } catch (error) {
      setIsBookmarked(originalBookmarkState);
      updateArticleEngagement(article.id, { bookmarked: originalBookmarkState });
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const handleLike = async () => {
    const originalLikeState = isLiked;
    const newLikeState = !originalLikeState;
    
    setIsLiked(newLikeState);
    updateArticleEngagement(article.id, { liked: newLikeState });

    try {
      if (originalLikeState) {
        await articleService.unlikeArticle(article.id);
      } else {
        await articleService.likeArticle(article.id);
      }
      
      // Persist the engagement state change
      await engagementPersistence.updateEngagementState(article.id, { liked: newLikeState });
    } catch (error) {
      setIsLiked(originalLikeState);
      updateArticleEngagement(article.id, { liked: originalLikeState });
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleShare = async () => {
    try {
      await articleService.shareArticle(article.id, {
        platform: 'general',
        message: `Check out this article: ${article.title}`,
        include_summary: true,
      });
      Alert.alert('Shared', 'Article shared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to share article');
    }
  };

  const handleOpenOriginal = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading article...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.retryText, { color: theme.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
        
        {/* Article Content */}
        <View style={[styles.articleContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.articleTitle, { color: theme.text }]}>{article.title}</Text>
          
          <View style={styles.articleMeta}>
            <Text style={[styles.articleAuthor, { color: theme.textSecondary }]}>
              {article.author}
            </Text>
            <Text style={[styles.articleDate, { color: theme.textSecondary }]}>
              {article.publishedAt}
            </Text>
            <Text style={[styles.articleSource, { color: theme.textSecondary }]}>
              {article.source?.name || 'Unknown'}
            </Text>
          </View>

          <Text style={[styles.articleSnippet, { color: theme.textSecondary }]}>
            {article.snippet}
          </Text>

          {fullArticle?.content && (
            <Text style={[styles.articleBody, { color: theme.text }]}>
              {fullArticle.content}
            </Text>
          )}

          {/* Open Original Link */}
          {article.url && (
            <TouchableOpacity onPress={handleOpenOriginal} style={[styles.originalLink, { backgroundColor: theme.cardBackground }]}>
              <Icon name="open-outline" size={20} color={theme.primary} />
              <Text style={[styles.originalLinkText, { color: theme.primary }]}>
                Read full article on {article.source?.name || 'Unknown'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            {console.log('📱 Rendering like icon, isLiked:', isLiked)}
            <Icon 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? theme.primary : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmark} style={styles.actionButton}>
            {console.log('📱 Rendering bookmark icon, isBookmarked:', isBookmarked)}
            <Icon 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isBookmarked ? theme.primary : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Icon name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 10,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  content: {
    flex: 1,
  },
  articleImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.5,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 15,
    fontFamily: 'Inter-Bold',
  },
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  articleAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  articleDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  articleSource: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  articleSnippet: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  articleBody: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  originalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  originalLinkText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ArticleDetail; 