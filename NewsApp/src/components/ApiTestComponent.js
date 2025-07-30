import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';
import articleService from '../services/articleService';
import embeddingService from '../services/embeddingService';

const ApiTestComponent = () => {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toISOString() }]);
  };

  const runAuthTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check if user is authenticated
      const isAuth = await authService.isAuthenticated();
      addResult('Authentication Check', true, `User authenticated: ${isAuth}`);

      if (!isAuth) {
        // Test 2: Try to register a test user
        try {
          const testEmail = `test${Date.now()}@example.com`;
          await authService.register({
            email: testEmail,
            password: 'testpass123',
            username: 'testuser',
            display_name: 'Test User',
            preferences: {
              categories: ['technology'],
              language: 'en',
              content_type: 'mixed'
            }
          });
          addResult('User Registration', true, 'Test user registered successfully');
        } catch (error) {
          addResult('User Registration', false, error.message);
        }
      }

      // Test 3: Get user profile
      try {
        const profile = await authService.getCurrentUser();
        addResult('Get User Profile', true, `Profile loaded: ${profile.username}`);
      } catch (error) {
        addResult('Get User Profile', false, error.message);
      }

    } catch (error) {
      addResult('Auth Tests', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const runArticleTests = async () => {
    setLoading(true);

    try {
      // Test 1: Get personalized feed
      try {
        const feed = await articleService.getPersonalizedFeed({ limit: 5 });
        addResult('Get Personalized Feed', true, `Loaded ${feed.articles?.length || 0} articles`);
      } catch (error) {
        addResult('Get Personalized Feed', false, error.message);
      }

      // Test 2: Get trending feed
      try {
        const trending = await articleService.getTrendingFeed({ timeframe: '24h' });
        addResult('Get Trending Feed', true, `Loaded ${trending.articles?.length || 0} trending articles`);
      } catch (error) {
        addResult('Get Trending Feed', false, error.message);
      }

      // Test 3: Search articles
      try {
        const search = await articleService.searchArticles('technology', { limit: 3 });
        addResult('Search Articles', true, `Found ${search.articles?.length || 0} results for "technology"`);
      } catch (error) {
        addResult('Search Articles', false, error.message);
      }

    } catch (error) {
      addResult('Article Tests', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const runEmbeddingTests = async () => {
    setLoading(true);

    try {
      // Test 1: Start embedding session
      embeddingService.startSession();
      addResult('Start Embedding Session', true, 'Session started');

      // Test 2: Add some test interactions
      embeddingService.trackArticleView('test-article-1', {
        view_duration_seconds: 30,
        percentage_read: 80,
        category: 'technology',
        source: 'test-source'
      });
      embeddingService.trackLike('test-article-1');
      addResult('Add Interactions', true, 'Added test interactions');

      // Test 3: Get local status
      const status = await embeddingService.getLocalStatus();
      addResult('Get Local Status', true, `Buffer size: ${status.buffer_size}, Articles processed: ${status.articles_since_update}`);

      // Test 4: Force update (this will fail if API is not available, but that's expected)
      try {
        await embeddingService.forceUpdate();
        addResult('Force Embedding Update', true, 'Update sent to server');
      } catch (error) {
        addResult('Force Embedding Update', false, `Expected failure: ${error.message}`);
      }

    } catch (error) {
      addResult('Embedding Tests', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Integration Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.authButton]} 
          onPress={runAuthTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.articleButton]} 
          onPress={runArticleTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Articles</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.embeddingButton]} 
          onPress={runEmbeddingTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Embeddings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Running tests...</Text>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={[styles.resultItem, result.success ? styles.successItem : styles.errorItem]}>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            <Text style={styles.resultTime}>{new Date(result.timestamp).toLocaleTimeString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#007AFF',
  },
  articleButton: {
    backgroundColor: '#34C759',
  },
  embeddingButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: theme.text,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  resultItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  successItem: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderLeftColor: '#34C759',
  },
  errorItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderLeftColor: '#FF3B30',
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  resultTime: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});

export default ApiTestComponent; 