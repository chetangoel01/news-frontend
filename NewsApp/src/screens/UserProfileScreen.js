
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';

const UserProfileScreen = ({ route, navigation, onLogin }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { email, password, username, display_name } = route.params;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [categories, setCategories] = useState([]);
  const [contentType, setContentType] = useState('mixed');
  const [loading, setLoading] = useState(false);

  const availableCategories = [
    'Technology', 'Business', 'Politics', 'Science', 'Health', 
    'Sports', 'Entertainment', 'World', 'Environment', 'Education'
  ];

  const toggleCategory = (category) => {
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    setCategories(newCategories);
  };

  const handleCompleteProfile = async () => {
    if (!firstName || !lastName) {
      return Alert.alert('Error', 'Please enter your first and last name.');
    }
    if (categories.length === 0) {
      return Alert.alert('Error', 'Please select at least one category.');
    }

    setLoading(true);
    try {
      await authService.register({
        email,
        password,
        username,
        display_name,
        first_name: firstName,
        last_name: lastName,
        preferences: {
          categories,
          language: 'en',
          content_type: contentType,
          notification_settings: {
            push_enabled: true,
            email_digest: true,
            breaking_news: true
          }
        }
      });
      
      // Automatically log the user in and go to home screen
      onLogin();
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your experience.</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor={theme.metaText}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor={theme.metaText}
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.sectionTitle}>What topics interest you?</Text>
        <View style={styles.categoriesContainer}>
          {availableCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categories.includes(category.toLowerCase())
                    ? theme.primary
                    : theme.cardBackground,
                  borderColor: theme.border
                }
              ]}
              onPress={() => toggleCategory(category.toLowerCase())}
            >
              <Text style={[
                styles.categoryText,
                {
                  color: categories.includes(category.toLowerCase())
                    ? '#fff'
                    : theme.text
                }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Content Type</Text>
        <View style={styles.radioContainer}>
          {['mixed', 'articles', 'videos'].map(type => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => setContentType(type)}
            >
              <View style={[
                styles.radioCircle,
                {
                  borderColor: theme.primary,
                  backgroundColor: contentType === type ? theme.primary : 'transparent'
                }
              ]}>
                {contentType === type && (
                  <View style={[styles.radioInner, { backgroundColor: '#fff' }]} />
                )}
              </View>
              <Text style={[styles.radioText, { color: theme.text }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleCompleteProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    fontSize: 16,
    color: theme.text,
    fontFamily: 'Inter-Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radioOption: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});

export default UserProfileScreen;
