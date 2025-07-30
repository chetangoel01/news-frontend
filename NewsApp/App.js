import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen_modern';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ArticleProvider, useArticles } from './src/context/ArticleContext';
import * as SplashScreen from 'expo-splash-screen';
import authService from './src/services/authService';
import articleService from './src/services/articleService';
import HorizontalFloatingNavBar from './src/components/HorizontalFloatingNavBar';

// Import debug functions for development
import './src/services/globalDebug';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component that uses navigation hooks inside NavigationContainer
const NavigationAwareFloatingBar = ({ onHomeRefresh }) => {
  const navigation = useNavigation();
  const [activeRouteName, setActiveRouteName] = useState('ArticlePager');

  // Update active route name when navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      try {
        const state = e.data?.state;
        if (state && state.routes && state.routes.length > 0) {
          const currentRoute = state.routes[state.index];
          if (currentRoute && currentRoute.name) {
            setActiveRouteName(currentRoute.name);
          }
        }
      } catch (error) {
        console.warn('Error updating route name:', error);
        // Keep the default route name if there's an error
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Hide navigation bar on ArticleDetail screen
  if (activeRouteName === 'ArticleDetail') {
    return null;
  }

  return (
    <HorizontalFloatingNavBar 
      navigation={navigation} 
      activeRouteName={activeRouteName} 
      onHomeRefresh={onHomeRefresh}
    />
  );
};

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { loadArticles } = useArticles();

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        // If authenticated, preload critical data
        if (authenticated) {
          console.log('🔐 User authenticated, preloading data...');
          // Preload data in background (don't await to avoid blocking UI)
          articleService.preloadCriticalData().catch(error => {
            console.log('Preload failed:', error.message);
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // This function will be passed down to the AuthScreen
  const handleLogin = () => {
    setIsAuthenticated(true);
    
    // Preload data after login
    console.log('🔐 User logged in, preloading data...');
    articleService.preloadCriticalData().catch(error => {
      console.log('Preload failed:', error.message);
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <NavigationContainer>
        <AppNavigator 
          isAuthenticated={isAuthenticated} 
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          isLoading={isLoading}
        />
        {isAuthenticated && (
          <NavigationAwareFloatingBar onHomeRefresh={() => loadArticles(true)} />
        )}
      </NavigationContainer>
    </>
  );
};

const RootView = ({ onLayoutRootView, children }) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
      {children}
    </View>
  );
};

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Font loading or other async tasks can go here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <ArticleProvider>
        <RootView onLayoutRootView={onLayoutRootView}>
          <AppContent />
        </RootView>
      </ArticleProvider>
    </ThemeProvider>
  );
};

export default App;

