import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import supabaseAuthService from '../services/supabaseAuthService';

const OAuthDebug = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const oauthStatus = await supabaseAuthService.getOAuthStatus();
      const configInfo = supabaseAuthService.getConfigurationInfo();
      const isInProgress = await supabaseAuthService.isOAuthInProgress();
      
      setStatus({
        oauthStatus,
        configInfo,
        isInProgress,
      });
    } catch (error) {
      setStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const testGoogleOAuth = async () => {
    setLoading(true);
    try {
      const result = await supabaseAuthService.googleSignIn();
      console.log('OAuth result:', result);
      alert('OAuth successful! Check console for details.');
    } catch (error) {
      console.error('OAuth error:', error);
      alert(`OAuth failed: ${error.message}`);
    } finally {
      setLoading(false);
      checkStatus();
    }
  };

  if (!status) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Configuration:</Text>
        <Text style={styles.value}>
          URL: {status.configInfo?.url ? '✅' : '❌'}
        </Text>
        <Text style={styles.value}>
          Anon Key: {status.configInfo?.anonKeyConfigured ? '✅' : '❌'}
        </Text>
        <Text style={styles.value}>
          Valid: {status.configInfo?.validation?.isValid ? '✅' : '❌'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>OAuth Status:</Text>
        <Text style={styles.value}>
          Google: {status.oauthStatus?.google?.user || 'Unknown'}
        </Text>
        <Text style={styles.value}>
          Session: {status.oauthStatus?.session || 'Unknown'}
        </Text>
        <Text style={styles.value}>
          In Progress: {status.isInProgress ? 'Yes' : 'No'}
        </Text>
      </View>

      {status.error && (
        <View style={styles.section}>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.error}>{status.error}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={testGoogleOAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing OAuth...' : 'Test Google OAuth'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={checkStatus}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Refresh Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    marginBottom: 2,
  },
  error: {
    fontSize: 12,
    color: 'red',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default OAuthDebug; 