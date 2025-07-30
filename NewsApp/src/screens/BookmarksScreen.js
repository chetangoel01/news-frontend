import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import HorizontalFloatingNavBar from '../components/HorizontalFloatingNavBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import articleService from '../services/articleService';
import engagementPersistence from '../services/engagementPersistence';
import Icon from 'react-native-vector-icons/Ionicons';

const BookmarksScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchBookmarks = useCallback(async (forceRefresh = false) => {
    if (hasLoaded && !forceRefresh) {
      return; // Already loaded, no need to refetch unless forced
    }

    setLoading(true);
    setError(null);
    try {
      const response = await articleService.getBookmarks();
      console.log('📚 Bookmarks API response:', response);
      
      const transformedBookmarks = await Promise.all(response.bookmarks.map(async (bookmark) => {
        const transformed = articleService.transformArticle(bookmark.article);
        
        // Load persisted engagement state
        const persistedEngagement = await engagementPersistence.getEngagementState(transformed.id);
        
        // Ensure bookmark state is set to true since these are bookmarked articles
        transformed.isBookmarked = true;
        
        // Merge engagement states: persisted > API response
        const mergedEngagement = {
          bookmarked: true,
          liked: persistedEngagement?.liked || transformed.engagement?.liked || false,
          shared: persistedEngagement?.shared || transformed.engagement?.shared || false,
        };
        
        // Set the engagement object for ArticleDetail compatibility
        transformed.engagement = mergedEngagement;
        
        // Also set direct properties for compatibility
        transformed.isLiked = mergedEngagement.liked;
        transformed.isBookmarked = true;
        
        console.log('📚 Transformed bookmark:', transformed.id, transformed.title, transformed.isBookmarked, transformed.isLiked, transformed.engagement);
        console.log('📚 Original engagement from API:', bookmark.article.engagement);
        console.log('📚 Persisted engagement:', persistedEngagement);
        
        return transformed;
      }));
      setBookmarks(transformedBookmarks);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [hasLoaded]);

  // Load data immediately when component mounts (background loading)
  useEffect(() => {
    fetchBookmarks();
  }, []); // Empty dependency array - runs once on mount

  // Refresh data when screen comes into focus (if not initial load)
  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad) {
        // Only refresh if it's not the initial load and we haven't loaded recently
        const lastRefresh = Date.now() - (5 * 60 * 1000); // 5 minutes
        if (!hasLoaded || Date.now() - lastRefresh > 5 * 60 * 1000) {
          fetchBookmarks(true); // Force refresh when coming into focus
        }
      }
    }, [fetchBookmarks, isInitialLoad, hasLoaded])
  );

  const handleRemoveBookmark = useCallback(async (articleId) => {
    try {
      await articleService.removeBookmark(articleId);
      setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== articleId));
      Alert.alert('Bookmark Removed', 'The article has been removed from your bookmarks.');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      Alert.alert('Error', 'Failed to remove bookmark. Please try again.');
    }
  }, []);

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const renderBookmarkItem = ({ item }) => {
    console.log('📚 Rendering bookmark item:', item.id, item.title, item.isBookmarked);
    return (
    <TouchableOpacity 
      style={[styles.bookmarkItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.bookmarkImage} />
      <View style={styles.bookmarkContent}>
        <Text style={[styles.bookmarkTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.bookmarkSnippet, { color: theme.textSecondary }]} numberOfLines={2}>{item.snippet}</Text>
        <Text style={[styles.bookmarkMeta, { color: theme.textSecondary }]}>
          {item.author} • {item.publishedAt}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
          handleRemoveBookmark(item.id);
        }} 
        style={[styles.removeButton, { borderWidth: 1, borderColor: theme.primary + '30' }]}
      >
        <Icon name="bookmark" size={24} color={theme.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

  // Show loading only on initial load, not on refresh
  if (loading && isInitialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centerContent, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading bookmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && isInitialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centerContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchBookmarks(true)}>
            <Text style={[styles.retryText, { color: theme.primary }]}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bookmarks</Text>
        {loading && !isInitialLoad && (
          <ActivityIndicator size="small" color={theme.primary} style={styles.headerLoader} />
        )}
      </View>
      {bookmarks.length === 0 ? (
        <View style={styles.placeholderContent}>
          <Text style={[styles.placeholderText, { color: theme.metaText }]}>No bookmarks yet.</Text>
          <Text style={[styles.placeholderText, { color: theme.metaText, marginTop: 10 }]}>Bookmark articles to save them for later!</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading && !isInitialLoad}
          onRefresh={() => fetchBookmarks(true)}
        />
      )}
      
      {/* Floating Navigation Bar */}
      <HorizontalFloatingNavBar 
        navigation={navigation} 
        activeRouteName="Bookmarks" 
        onHomeRefresh={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  headerLoader: {
    marginLeft: 10,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 120, // Space for the floating nav bar
  },
  bookmarkItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  bookmarkContent: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookmarkSnippet: {
    fontSize: 13,
    marginBottom: 4,
  },
  bookmarkMeta: {
    fontSize: 11,
    opacity: 0.7,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },


  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});

export default BookmarksScreen;