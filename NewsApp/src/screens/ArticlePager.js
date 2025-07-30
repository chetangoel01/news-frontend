import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Alert, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useTheme } from '../context/ThemeContext';
import { useArticles } from '../context/ArticleContext';
import articleService from '../services/articleService';
import embeddingService from '../services/embeddingService';
import HorizontalFloatingNavBar from '../components/HorizontalFloatingNavBar';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ZoomableCard = ({ card, onPress }) => {
  // Handle case where card is null or undefined
  if (!card) {
    return (
      <View style={styles.shadowWrapper}>
        <View style={[styles.cardContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.noImageContainer}>
            <Icon name="document-outline" size={48} color={theme.isDark ? '#34495e' : '#bdc3c7'} />
            <Text style={[styles.noImageText, { color: theme.isDark ? '#34495e' : '#bdc3c7' }]}>
              No Article Data
            </Text>
          </View>
        </View>
      </View>
    );
  }
  const { theme } = useTheme();
  const imageScale = useSharedValue(1);
  const savedImageScale = useSharedValue(1);

  // Helper function to render meta information conditionally
  const renderMetaInfo = () => {
    const metaItems = [];
    
    // Add author if available
    if (card.author && card.author.trim() !== '' && card.author !== 'Unknown') {
      metaItems.push(
        <Text key="author" style={styles.author} numberOfLines={1} ellipsizeMode="tail">
          {card.author}
        </Text>
      );
    }
    
    // Add published date if available
    if (card.publishedAt && card.publishedAt.trim() !== '' && card.publishedAt !== 'Unknown') {
      if (metaItems.length > 0) {
        metaItems.push(<View key="separator1" style={styles.separator} />);
      }
      metaItems.push(
        <Text key="publishedAt" style={styles.publishedAt}>
          {card.publishedAt}
        </Text>
      );
    }
    
    // Add source if available
    if (card.source && card.source.trim() !== '' && card.source !== 'Unknown') {
      if (metaItems.length > 0) {
        metaItems.push(<View key="separator2" style={styles.separator} />);
      }
      metaItems.push(
        <Text key="source" style={styles.source}>
          {card.source}
        </Text>
      );
    }
    
    // If no meta information is available, show a fallback
    if (metaItems.length === 0) {
      metaItems.push(
        <Text key="fallback" style={styles.fallbackMeta}>
          Article
        </Text>
      );
    }
    
    return metaItems;
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedImageScale.value = imageScale.value;
    })
    .onUpdate((event) => {
      const newScale = savedImageScale.value * event.scale;
      imageScale.value = Math.max(1.0, Math.min(2.0, newScale));
    })
    .onEnd(() => {
      imageScale.value = withSpring(1);
    });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: imageScale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={pinchGesture}>
      <View style={styles.shadowWrapper}>
        <TouchableOpacity 
          style={[styles.cardContainer, { backgroundColor: theme.cardBackground }]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Image at the top */}
          <View style={styles.imageContainer}>
            {card.imageUrl ? (
              <Animated.Image
                source={{ uri: card.imageUrl }}
                style={[styles.articleImage, imageAnimatedStyle]}
                resizeMode="cover"
                onError={() => {
                  console.log('📱 Image failed to load:', card.imageUrl);
                }}
              />
            ) : (
              <Animated.View 
                style={[
                  styles.articleImage, 
                  { backgroundColor: theme.isDark ? '#2c3e50' : '#f8f9fa' }, 
                  imageAnimatedStyle
                ]} 
              >
                <View style={styles.noImageContainer}>
                  <Icon name="image-outline" size={48} color={theme.isDark ? '#34495e' : '#bdc3c7'} />
                  <Text style={[styles.noImageText, { color: theme.isDark ? '#34495e' : '#bdc3c7' }]}>
                    No Image
                  </Text>
                </View>
              </Animated.View>
            )}
            

          </View>
          
          {/* Text content with gradient background */}
          <View style={styles.textSection}>
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.1)',
                'rgba(0,0,0,0.4)',
                'rgba(0,0,0,0.8)',
                'rgba(0,0,0,0.95)'
              ]}
              locations={[0, 0.3, 0.7, 1]}
              style={styles.textGradient}
            />
            
            <View style={styles.textContent}>
                          <Text 
              style={styles.title}
              numberOfLines={3}
              adjustsFontSizeToFit={false}
            >
              {card.title || 'Untitled Article'}
            </Text>
              
              <Text 
                style={styles.snippet}
                numberOfLines={4}
                ellipsizeMode="tail"
              >
                {card.snippet || 'No description available'}
              </Text>
              
              <View style={styles.metaContainer}>
                <View style={styles.authorContainer}>
                  {renderMetaInfo()}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </GestureDetector>
  );
};

export default function ArticlePager() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { articles, loading, refreshing, error, hasMore, loadArticles, setError, checkAndLoadMoreArticles } = useArticles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isRefreshingEnd, setIsRefreshingEnd] = useState(false);

  // Load articles only on first mount
  useEffect(() => {
    console.log('📱 ArticlePager mounted - loading articles');
    loadArticles();
  }, []); // Remove loadArticles from dependencies to prevent infinite re-renders

  // Load more articles when remaining articles are few
  // With 50 articles per batch, we load more when 25 or fewer articles remain
  useEffect(() => {
    if (articles.length > 0 && 
        articles.length - currentIndex <= 25 && 
        hasMore &&
        !loading && 
        !refreshing && 
        !isLoadingMore) {
      console.log('📱 25 or fewer articles remaining, loading more...');
      setIsLoadingMore(true);
      checkAndLoadMoreArticles().finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [currentIndex, articles.length, hasMore, loading, refreshing, isLoadingMore, checkAndLoadMoreArticles]);

  const handleSwipe = useCallback((direction, index) => {
    setCurrentIndex(index + 1);
    
    // Track the article that was swiped
    if (articles[index]) {
      const article = articles[index];
      const viewData = {
        view_duration_seconds: 5.0, // Minimal view time for swipe
        percentage_read: direction === 'up' ? 20 : 5, // Higher for up swipe (positive)
        interaction_type: `swipe_${direction}`,
        swipe_direction: direction,
        category: article.category || 'general',
        source: article.source?.name || 'unknown',
      };
      
      // Track the view
      articleService.trackArticleView(article.id, viewData);
      embeddingService.trackArticleView(article.id, viewData);
      
      console.log(`📱 Tracked swipe ${direction} for article: ${article.title.substring(0, 50)}...`);
    }
  }, [articles]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshingEnd(true);
    setHasReachedEnd(false);
    setCurrentIndex(0);
    
    // Track that user is requesting fresh content
    console.log('📱 User requested fresh articles - tracking refresh request');
    
    try {
      await loadArticles(true); // Force refresh to get new articles
    } finally {
      setIsRefreshingEnd(false);
    }
  }, [loadArticles]);

  // Check if user has reached the end of available articles
  useEffect(() => {
    // User has reached the end if:
    // 1. They're at the last article (or past it)
    // 2. There are no more articles to load (hasMore is false)
    // 3. Not currently loading
    // 4. Have some articles to show
    if (articles.length > 0 && 
        currentIndex >= articles.length - 1 && 
        !hasMore && 
        !loading && 
        !refreshing) {
      setHasReachedEnd(true);
    } else {
      setHasReachedEnd(false);
    }
  }, [currentIndex, articles.length, hasMore, loading, refreshing]);

  const handleArticleTap = useCallback((article) => {
    // Track the tap interaction as a more significant engagement
    const viewData = {
      view_duration_seconds: 10.0, // Higher for tap interaction
      percentage_read: 50, // Higher percentage for tap
      interaction_type: 'tap_to_read',
      swipe_direction: 'tap',
      category: article.category || 'general',
      source: article.source?.name || 'unknown',
    };
    
    // Track the view
    articleService.trackArticleView(article.id, viewData);
    embeddingService.trackArticleView(article.id, viewData);
    
    console.log(`📱 Tracked tap for article: ${article.title.substring(0, 50)}...`);
    
    // Navigate to article detail screen
    navigation.navigate('ArticleDetail', { article });
  }, [navigation]);

  const renderCard = (card) => {
    if (!card) return null;
    
    return (
      <ZoomableCard 
        card={card} 
        onPress={() => handleArticleTap(card)}
      />
    );
  };

  // Show loading state
  if (loading && articles.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading articles...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIcon, { backgroundColor: theme.cardBackground }]}>
            <Icon name="alert-circle-outline" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.errorText, { color: theme.text }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadArticles}
          >
            <Text style={styles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show empty state
  if (articles.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.cardBackground }]}>
            <Icon name="newspaper-outline" size={32} color={theme.textSecondary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No articles available
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadArticles}
          >
            <Text style={styles.retryButtonText}>Tap to refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show end-of-content message when user has swiped through all articles
  if (hasReachedEnd) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.endOfContentContainer}>
          <View style={[styles.endOfContentIcon, { backgroundColor: theme.cardBackground }]}>
            <Icon name="checkmark-circle-outline" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.endOfContentTitle, { color: theme.text }]}>
            You've swiped through all articles!
          </Text>
          <Text style={[styles.endOfContentText, { color: theme.textSecondary }]}>
            We'll load newer articles for you to continue discovering great content.
          </Text>
          <TouchableOpacity 
            style={[
              styles.retryButton, 
              { 
                backgroundColor: isRefreshingEnd ? theme.textSecondary : theme.primary,
                opacity: isRefreshingEnd ? 0.7 : 1
              }
            ]}
            onPress={handleRefresh}
            disabled={isRefreshingEnd}
          >
            {isRefreshingEnd ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                <Text style={styles.retryButtonText}>Loading...</Text>
              </View>
            ) : (
              <Text style={styles.retryButtonText}>Load Newer Articles</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log('📱 Rendering Swiper with', articles.length, 'articles');
  console.log('📱 Current index:', currentIndex, 'Remaining articles:', articles.length - currentIndex);
  console.log('📱 First few article titles:', articles.slice(0, 3).map(a => a?.title));
  
  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={articles}
        renderCard={renderCard}
        stackSize={3}
        stackScale={5}
        stackSeparation={8}
        cardVerticalMargin={0}
        backgroundColor="transparent"
        cardIndex={currentIndex}
        containerStyle={styles.swiperContainer}
        cardStyle={styles.cardStyle}
        onSwipedLeft={(i) => handleSwipe('left', i)}
        onSwipedRight={(i) => handleSwipe('right', i)}
        onSwipedTop={(i) => handleSwipe('top', i)}
        onSwipedBottom={(i) => handleSwipe('bottom', i)}
        onSwipedAll={() => {
          // Track the last article before loading more
          if (articles.length > 0) {
            const lastArticle = articles[articles.length - 1];
            const viewData = {
              view_duration_seconds: 3.0,
              percentage_read: 15,
              interaction_type: 'swipe_end',
              swipe_direction: 'end',
              category: lastArticle.category || 'general',
              source: lastArticle.source?.name || 'unknown',
            };
            
            articleService.trackArticleView(lastArticle.id, viewData);
            embeddingService.trackArticleView(lastArticle.id, viewData);
            console.log(`📱 Tracked end swipe for article: ${lastArticle.title.substring(0, 50)}...`);
          }
          
          // Load more articles when user reaches the end
          loadArticles(true); // Force refresh to get new articles
        }}
      />
      
      {/* Refresh indicator */}
      {refreshing && (
        <View style={[styles.refreshIndicator, { backgroundColor: theme.cardBackground }]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.refreshText, { color: theme.text }]}>
            Refreshing...
          </Text>
        </View>
      )}
      
      {/* Loading more articles indicator */}
      {isLoadingMore && (
        <View style={[styles.loadingMoreIndicator, { backgroundColor: theme.cardBackground }]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingMoreText, { color: theme.text }]}>
            Loading more articles...
          </Text>
        </View>
      )}
    </View>
  );
}

const CARD_WIDTH = SCREEN_W;
const CARD_HEIGHT = SCREEN_H; // Card is full screen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginLeft: -20,
  },
  cardStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  shadowWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  cardContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 0,
    position: 'relative',
  },
  // Image container - takes up top 60% of the card
  imageContainer: {
    height: '60%',
    width: '100%',
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  // Text section - takes up bottom 40% with gradient
  textSection: {
    height: '40%',
    width: '100%',
    position: 'relative',
  },
  textGradient: {
    position: 'absolute',
    top: -80, // Extend gradient up into the image area
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 140, // Space for nav bar
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    color: 'white',
    marginBottom: 12,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  snippet: {
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaContainer: {
    alignItems: 'flex-start',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: -0.1,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 10,
  },
  publishedAt: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  source: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fallbackMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 280,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  loadingMoreIndicator: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  endOfContentContainer: {
    alignItems: 'center',
    maxWidth: 280,
    paddingVertical: 40,
  },
  endOfContentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  endOfContentTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  endOfContentText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
});