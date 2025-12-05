import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import authTest from '../utils/authTest';

const AuthTestComponent = ({ visible = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleTestAuth = async () => {
    setIsLoading(true);
    try {
      const result = await authTest.testAuthStatus();
      setResults({ type: 'auth', data: result });
      
      if (result.authenticated) {
        Alert.alert('✅ Success', 'Authentication is working correctly!');
      } else {
        Alert.alert('❌ Failed', `Authentication failed: ${result.reason}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authTest.testLogin();
      setResults({ type: 'login', data: result });
      
      if (result.success) {
        Alert.alert('✅ Success', 'Login test successful!');
      } else {
        Alert.alert('❌ Failed', `Login failed: ${result.reason}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Login test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestViewTracking = async () => {
    setIsLoading(true);
    try {
      // Use a test article ID from the database
      const testArticleId = '5d696664-5617-47a1-aedd-c6b601ce386f';
      const result = await authTest.testViewTracking(testArticleId);
      setResults({ type: 'view', data: result });
      
      if (result.success) {
        Alert.alert('✅ Success', 'View tracking is working correctly!');
      } else {
        Alert.alert('❌ Failed', `View tracking failed: ${result.reason}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `View tracking test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTokenRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await authTest.testTokenRefresh();
      setResults({ type: 'refresh', data: result });
      
      if (result.authenticated) {
        Alert.alert('✅ Success', 'Token refresh successful!');
      } else {
        Alert.alert('❌ Failed', `Token refresh failed: ${result.reason}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Token refresh test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Authentication Test</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.authButton, isLoading && styles.buttonDisabled]}
        onPress={handleTestAuth}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Auth Status'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.loginButton, isLoading && styles.buttonDisabled]}
        onPress={handleTestLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.viewButton, isLoading && styles.buttonDisabled]}
        onPress={handleTestViewTracking}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test View Tracking'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.refreshButton, isLoading && styles.buttonDisabled]}
        onPress={handleTestTokenRefresh}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Token Refresh'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📋 Test Results:</Text>
          <Text style={styles.resultsText}>
            {JSON.stringify(results, null, 2)}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>
          💡 Use these tests to debug authentication and view tracking issues.
          Check the console for detailed logs.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#007AFF',
  },
  loginButton: {
    backgroundColor: '#34C759',
  },
  viewButton: {
    backgroundColor: '#FF9500',
  },
  refreshButton: {
    backgroundColor: '#AF52DE',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});

export default AuthTestComponent; 