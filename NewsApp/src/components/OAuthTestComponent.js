import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import oauthService from '../services/oauthService';
import authService from '../services/authService';

const OAuthTestComponent = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      margin: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 6,
      marginVertical: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    statusText: {
      color: theme.metaText,
      fontSize: 12,
      marginTop: 10,
      textAlign: 'center',
    },
  });

  const testGoogleAuth = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Google OAuth...');
      const result = await oauthService.googleSignIn();
      console.log('✅ Google OAuth successful:', result);
      Alert.alert('Success', 'Google OAuth test passed!');
    } catch (error) {
      console.error('❌ Google OAuth test failed:', error);
      Alert.alert('Error', `Google OAuth test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAppleAuth = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Apple OAuth...');
      const result = await oauthService.appleSignIn();
      console.log('✅ Apple OAuth successful:', result);
      Alert.alert('Success', 'Apple OAuth test passed!');
    } catch (error) {
      console.error('❌ Apple OAuth test failed:', error);
      Alert.alert('Error', `Apple OAuth test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      const tokens = await authService.getTokens();
      console.log('🔍 Auth status:', { isAuthenticated, tokens });
      Alert.alert(
        'Auth Status', 
        `Authenticated: ${isAuthenticated}\nAccess Token: ${tokens.accessToken ? 'Present' : 'Missing'}`
      );
    } catch (error) {
      console.error('❌ Auth status check failed:', error);
      Alert.alert('Error', `Auth status check failed: ${error.message}`);
    }
  };

  const testOAuthStatus = async () => {
    try {
      const status = await oauthService.getOAuthStatus();
      console.log('🔍 OAuth status:', status);
      Alert.alert(
        'OAuth Status', 
        `Google: ${status.google.available ? 'Available' : 'Not available'}\nApple: ${status.apple.available ? 'Available' : 'Not available'}`
      );
    } catch (error) {
      console.error('❌ OAuth status check failed:', error);
      Alert.alert('Error', `OAuth status check failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth Test Component (Expo Go)</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.6 }]} 
        onPress={testGoogleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Google OAuth</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.6 }]} 
        onPress={testAppleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Apple OAuth</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testAuthStatus}
      >
        <Text style={styles.buttonText}>Check Auth Status</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testOAuthStatus}
      >
        <Text style={styles.buttonText}>Check OAuth Status</Text>
      </TouchableOpacity>

      <Text style={styles.statusText}>
        Using Expo AuthSession for OAuth (compatible with Expo Go)
      </Text>
    </View>
  );
};

export default OAuthTestComponent; 