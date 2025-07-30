import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ArticleCard = ({ article, onPress, theme }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatReadTime = (minutes) => {
    if (!minutes) return '';
    if (minutes < 1) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={() => onPress(article)}
      activeOpacity={0.8}
    >
      {/* Image */}
      {article.image_url && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text 
          style={[styles.title, { color: theme.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>

        {/* Summary */}
        {article.summary && (
          <Text 
            style={[styles.summary, { color: theme.metaText }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {article.summary}
          </Text>
        )}

        {/* Meta information */}
        <View style={styles.metaContainer}>
          {/* Source and date */}
          <View style={styles.sourceDateContainer}>
            <Text 
              style={[styles.source, { color: theme.primary }]}
              numberOfLines={1}
            >
              {article.source?.name || 'Unknown'}
            </Text>
            <Text style={[styles.date, { color: theme.metaText }]}>
              {formatDate(article.published_at)}
            </Text>
          </View>

          {/* Engagement metrics */}
          <View style={styles.engagementContainer}>
            {article.engagement?.views > 0 && (
              <View style={styles.engagementItem}>
                <Icon name="eye-outline" size={12} color={theme.metaText} />
                <Text style={[styles.engagementText, { color: theme.metaText }]}>
                  {article.engagement.views}
                </Text>
              </View>
            )}
            
            {article.engagement?.likes > 0 && (
              <View style={styles.engagementItem}>
                <Icon name="heart-outline" size={12} color={theme.metaText} />
                <Text style={[styles.engagementText, { color: theme.metaText }]}>
                  {article.engagement.likes}
                </Text>
              </View>
            )}

            {article.read_time_minutes && (
              <View style={styles.engagementItem}>
                <Icon name="time-outline" size={12} color={theme.metaText} />
                <Text style={[styles.engagementText, { color: theme.metaText }]}>
                  {formatReadTime(article.read_time_minutes)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Category badge */}
        {article.category && (
          <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: theme.primary }]}>
              {article.category}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  summary: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  sourceDateContainer: {
    flex: 1,
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  engagementText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
});

export default ArticleCard; 