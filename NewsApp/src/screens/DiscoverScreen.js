import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import HorizontalFloatingNavBar from '../components/HorizontalFloatingNavBar';
import { useNavigation } from '@react-navigation/native';
import ArticleCard from '../components/ArticleCard';
import { useArticles } from '../context/ArticleContext';
import articleService from '../services/articleService';

const DiscoverScreen = memo(() => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { articleService: contextArticleService } = useArticles();

  // Search state
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setSearchMetadata(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const performSearch = async () => {
    if (!searchText.trim()) return;

    setIsSearching(true);
    try {
      const response = await articleService.searchArticles(searchText.trim(), {
        semantic: true,
        date_range: 'all',
        sort: 'relevance',
        limit: 20,
      });

      setSearchResults(response.articles || []);
      setSearchMetadata(response.search_metadata);
      
      // Add to search history
      addToSearchHistory(searchText.trim());
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search articles. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addToSearchHistory = (query) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== query);
      // Add to beginning
      return [query, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  };

  const handleHistoryItemPress = (query) => {
    setSearchText(query);
    setShowHistory(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleHistoryItemPress(item)}
    >
      <Icon name="time-outline" size={16} color={theme.metaText} style={styles.historyIcon} />
      <Text style={[styles.historyText, { color: theme.text }]} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
      theme={theme}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.cardBackground }]}>
        <Icon name="search" size={20} color={theme.metaText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.cardBackground }]}
          placeholder="Search articles, topics, sources..."
          placeholderTextColor={theme.metaText}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setShowHistory(text.length === 0);
          }}
          onFocus={() => setShowHistory(searchText.length === 0)}
          returnKeyType="search"
          onSubmitEditing={performSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText('');
            setSearchResults([]);
            setSearchMetadata(null);
            setShowHistory(true);
          }} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color={theme.metaText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Area */}
      {searchText.trim().length >= 2 ? (
        // Show search results
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsHeader}>
            <Text style={[styles.searchResultsTitle, { color: theme.text }]}>
              Search Results
            </Text>
            {searchMetadata && (
              <Text style={[styles.searchResultsCount, { color: theme.metaText }]}>
                {searchMetadata.total_results} results
              </Text>
            )}
          </View>
          
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.metaText }]}>
                Searching...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="search-outline" size={48} color={theme.metaText} />
              <Text style={[styles.noResultsText, { color: theme.metaText }]}>
                No results found for "{searchText}"
              </Text>
              <Text style={[styles.noResultsSubtext, { color: theme.metaText }]}>
                Try different keywords or browse your search history
              </Text>
            </View>
          )}
        </View>
      ) : showHistory && searchHistory.length > 0 ? (
        // Show search history
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>Recent Searches</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={[styles.clearHistoryText, { color: theme.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
          />
        </View>
      ) : (
        // Show default content
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholderContent}>
            <Icon name="search-outline" size={64} color={theme.metaText} />
            <Text style={[styles.placeholderTitle, { color: theme.text }]}>
              Start Exploring
            </Text>
            <Text style={[styles.placeholderText, { color: theme.metaText }]}>
              Search for articles, topics, or sources to discover interesting content
            </Text>
          </View>
        </ScrollView>
      )}
      
      {/* Floating Navigation Bar */}
      <HorizontalFloatingNavBar 
        navigation={navigation} 
        activeRouteName="Discover" 
        onHomeRefresh={() => {}}
      />
    </SafeAreaView>
  );
});

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Add space for floating navigation bar
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    marginLeft: 10,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginTop: 15,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    // paddingBottom: 100, // Add space for floating navigation bar
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  searchResultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  searchResultsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Add space for floating navigation bar
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  clearHistoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  historyList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  historyIcon: {
    marginRight: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});

export default DiscoverScreen;