import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../constants/Colors';

const ThemeContext = createContext();

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(THEME_MODES.AUTO);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Get the actual theme based on mode and device settings
  const getCurrentTheme = () => {
    if (themeMode === THEME_MODES.LIGHT) {
      return lightColors;
    } else if (themeMode === THEME_MODES.DARK) {
      return darkColors;
    } else {
      // AUTO mode - follow device settings
      return Appearance.getColorScheme() === 'dark' ? darkColors : lightColors;
    }
  };

  // Update dark mode state based on current theme
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    setIsDarkMode(currentTheme === darkColors);
  }, [themeMode]);

  // Listen for device theme changes when in AUTO mode
  useEffect(() => {
    if (themeMode === THEME_MODES.AUTO) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const currentTheme = getCurrentTheme();
        setIsDarkMode(currentTheme === darkColors);
      });

      return () => subscription?.remove();
    }
  }, [themeMode]);

  // Load saved theme mode on app start
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode && Object.values(THEME_MODES).includes(savedMode)) {
          setThemeMode(savedMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Save theme mode when it changes
  useEffect(() => {
    const saveThemeMode = async () => {
      try {
        await AsyncStorage.setItem('themeMode', themeMode);
      } catch (error) {
        console.error('Failed to save theme mode:', error);
      }
    };

    saveThemeMode();
  }, [themeMode]);

  const theme = getCurrentTheme();

  const setThemeModeAndSave = (mode) => {
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode, 
      themeMode,
      setThemeMode: setThemeModeAndSave,
      THEME_MODES 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
