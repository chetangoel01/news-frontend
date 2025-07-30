import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ title, leftIcon, onLeftPress, rightIcon, onRightPress }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground }]}>
      {leftIcon && (
        <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
          <Icon name={leftIcon} size={24} color={theme.headerText} />
        </TouchableOpacity>
      )} 
      <Text style={[styles.headerTitle, { color: theme.headerText }]}>{title}</Text>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
          <Icon name={rightIcon} size={24} color={theme.headerText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 50, // Adjust for safe area
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0, // No border by default, can be added via theme if needed
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    paddingHorizontal: 15,
  },
});

export default CustomHeader;
