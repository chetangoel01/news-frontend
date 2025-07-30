import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TOPICS = [
  'Technology', 'Business', 'Politics', 'Sports', 'Entertainment',
  'Science', 'Health', 'World', 'Local', 'Opinion'
];

const SearchOverlay = ({ isVisible, onClose, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  const handleTopicPress = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSearch = () => {
    onSearch({ query: searchQuery, topics: selectedTopics });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={20} />
      
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Search News</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#0A84FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.topicsContainer}>
          <Text style={styles.topicsTitle}>Popular Topics</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsScroll}
          >
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.topicChip,
                  selectedTopics.includes(topic) && styles.topicChipSelected
                ]}
                onPress={() => handleTopicPress(topic)}
              >
                <Text style={[
                  styles.topicText,
                  selectedTopics.includes(topic) && styles.topicTextSelected
                ]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  topicsContainer: {
    marginBottom: 40,
  },
  topicsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    fontFamily: 'System',
  },
  topicsScroll: {
    paddingRight: 20,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topicChipSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  topicText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  topicTextSelected: {
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default SearchOverlay; 