
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, 
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Animated 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../services/authService';
import oauthService from '../services/oauthService';

const FADE_DURATION = 300;
const SPACING = 20;

const AuthScreen = ({ onLogin }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [isLoginView, setIsLoginView] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({ google: false, apple: false });

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isLoginView]);

  const handleAuth = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    if (!isLoginView && password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }
    if (password.length < 8) {
      return Alert.alert('Error', 'Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      if (isLoginView) {
        await authService.login({ email, password });
        onLogin();
      } else {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const timestamp = Date.now().toString().slice(-6);
        const username = `${baseUsername}${timestamp}`;
        
        await authService.register({
          email,
          password,
          username,
          display_name: email.split('@')[0],
        });
        onLogin();
      }
    } catch (error) {
      Alert.alert('Authentication Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(prev => ({ ...prev, [provider]: true }));
    try {
      if (provider === 'google') {
        await oauthService.googleSignIn();
      } else if (provider === 'apple') {
        await oauthService.appleSignIn();
      }
      onLogin();
    } catch (error) {
      Alert.alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-In Error`, error.message);
    } finally {
      setOauthLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const toggleView = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION / 2,
      useNativeDriver: true,
    }).start(() => {
      setIsLoginView(!isLoginView);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION / 2,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderAuthInputs = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.metaText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min. 8 characters)"
        placeholderTextColor={theme.metaText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!isLoginView && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={theme.metaText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
    </View>
  );

  const renderOAuthButtons = () => (
    <>
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>
      <TouchableOpacity
        style={[styles.oauthButton, { borderColor: theme.border }]}
        onPress={() => handleOAuth('google')}
        disabled={oauthLoading.google || oauthLoading.apple}
      >
        <Icon name="logo-google" size={22} color={theme.text} />
        <Text style={[styles.oauthButtonText, { color: theme.text }]}>
          {oauthLoading.google ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.oauthButton, { borderColor: theme.border }]}
        onPress={() => handleOAuth('apple')}
        disabled={oauthLoading.google || oauthLoading.apple}
      >
        <Icon name="logo-apple" size={22} color={theme.text} />
        <Text style={[styles.oauthButtonText, { color: theme.text }]}>
          {oauthLoading.apple ? 'Signing in...' : 'Continue with Apple'}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>NewsApp</Text>
            <Text style={styles.subtitle}>
              {isLoginView ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {renderAuthInputs()}
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : (isLoginView ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            {isLoginView && renderOAuthButtons()}
          </Animated.View>

          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, { color: theme.textSecondary }]}>
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={toggleView}>
              <Text style={[styles.switchLink, { color: theme.primary }]}>
                {isLoginView ? ' Sign Up' : ' Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.primary,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: theme.textSecondary,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: SPACING,
    paddingVertical: 16,
    marginBottom: 12,
    fontSize: 16,
    color: theme.text,
    fontFamily: 'Inter-Regular',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING * 1.5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING * 2,
  },
  switchText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  switchLink: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});

export default AuthScreen;
