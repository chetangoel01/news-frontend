import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import ArticlePager from '../screens/ArticlePager';
import ArticleDetail from '../screens/ArticleDetail';
import UserSettings from '../screens/UserSettings';
import DiscoverScreen from '../screens/DiscoverScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import AuthScreen from '../screens/AuthScreen_modern';
import UserProfileScreen from '../screens/UserProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated, handleLogin, handleLogout, isLoading }) => {
  const { theme } = useTheme();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
      detachInactiveScreens: false, // Keep screens mounted in background
      unmountOnBlur: false, // Don't unmount screens when they lose focus
    }}
  >
    {isAuthenticated ? (
      <>
        <Stack.Screen 
          name="ArticlePager" 
          component={ArticlePager} 
          options={{ 
            animation: 'none',
            lazy: false, // Load immediately
          }} 
        />
        <Stack.Screen 
          name="ArticleDetail" 
          component={ArticleDetail} 
          options={{ 
            animation: 'slide_from_right',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="UserSettings" 
          options={{ 
            animation: 'none',
            lazy: false, // Load immediately
          }} 
        >
          {(props) => <UserSettings {...props} onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen 
          name="Discover" 
          component={DiscoverScreen} 
          options={{ 
            animation: 'none',
            lazy: false, // Load immediately
          }} 
        />
        <Stack.Screen 
          name="Bookmarks" 
          component={BookmarksScreen} 
          options={{ 
            animation: 'none',
            lazy: false, // Load immediately
          }} 
        />
      </>
    ) : (
        <>
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="UserProfile">
            {(props) => <UserProfileScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        </>
      )}
  </Stack.Navigator>
  );
};

export default AppNavigator;
