import React, { useRef, useCallback, memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const HorizontalFloatingNavBar = memo(({ navigation, activeRouteName, onHomeRefresh }) => {
  const { theme, isDarkMode } = useTheme();

  const navItems = [
    {
      name: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      screen: 'ArticlePager',
    },
    {
      name: 'Discover',
      icon: 'search-outline',
      activeIcon: 'search',
      screen: 'Discover',
    },
    {
      name: 'Bookmarks',
      icon: 'bookmarks-outline',
      activeIcon: 'bookmarks',
      screen: 'Bookmarks',
    },
    {
      name: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
      screen: 'UserSettings',
    },
  ];

  const animatedValues = useRef(navItems.map(() => new Animated.Value(1))).current;

  const handlePressIn = useCallback((index) => {
    Animated.spring(animatedValues[index], {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
  }, [animatedValues]);

  const handlePressOut = useCallback((index, screen) => {
    Animated.spring(animatedValues[index], {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start(() => {
      // Handle home button press when already on home screen
      if (screen === 'ArticlePager' && activeRouteName === 'ArticlePager') {
        console.log('📱 Home button pressed while on home screen - refreshing');
        onHomeRefresh?.();
      }
      // Only navigate if we're not already on the target screen
      else if (activeRouteName !== screen) {
        navigation.navigate(screen);
      }
    });
  }, [activeRouteName, navigation, animatedValues, onHomeRefresh]);

  return (
    <View style={[styles.container, { borderColor: theme.border, shadowColor: theme.shadowColor }]}>
      <BlurView style={StyleSheet.absoluteFill} tint={isDarkMode ? "dark" : "light"} intensity={80} />
      {navItems.map((item, index) => {
        const isActive = activeRouteName === item.screen;
        return (
          <TouchableOpacity
            key={index}
            style={styles.navButton}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index, item.screen)}
            activeOpacity={0.7}
          >
            <Animated.View style={[
              styles.animatedButtonContent,
              { transform: [{ scale: animatedValues[index] }] }
            ]}>
              <Icon 
                name={isActive ? item.activeIcon : item.icon} 
                size={24} 
                color={isActive ? theme.primary : theme.text} 
              />
              <Text style={[
                styles.navText, 
                { color: isActive ? theme.primary : theme.text }
              ]}>
                {item.name}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    overflow: 'hidden',
    zIndex: 1000, // Ensure it's above other content
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginHorizontal: 2,
  },
  animatedButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});

export default HorizontalFloatingNavBar;
