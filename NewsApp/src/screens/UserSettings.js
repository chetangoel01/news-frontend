import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import articleService from '../services/articleService';
import authService from '../services/authService';

const UserSettings = ({ navigation, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [cacheStats, setCacheStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCacheStats();
    loadUserProfile();
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await articleService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        loadCacheStats(),
        loadUserProfile()
      ]);
      Alert.alert('Success', 'Settings refreshed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh settings');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app will need to reload data from the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await articleService.clearCache();
              await loadCacheStats(); // Reload stats
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Call the onLogout function passed from App.js
              await onLogout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await authService.updatePreferences(newPreferences);
      await loadUserProfile(); // Reload profile to get updated preferences
      Alert.alert('Success', 'Preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const toggleNotificationSetting = (setting) => {
    if (!userProfile?.preferences) return;
    
    const currentPrefs = userProfile.preferences;
    const notificationSettings = currentPrefs.notification_settings || {};
    
    const updatedPrefs = {
      ...currentPrefs,
      notification_settings: {
        ...notificationSettings,
        [setting]: !notificationSettings[setting]
      }
    };
    
    handleUpdatePreferences(updatedPrefs);
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, showArrow = true, isDestructive = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={isDestructive ? theme.error : theme.primary} 
          style={styles.settingIcon} 
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: isDestructive ? theme.error : theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && <Icon name="chevron-forward" size={20} color={theme.textSecondary} />}
    </TouchableOpacity>
  );

  const renderToggleItem = ({ icon, title, subtitle, value, onToggle, isDestructive = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
      onPress={onToggle}
    >
      <View style={styles.settingLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={isDestructive ? theme.error : theme.primary} 
          style={styles.settingIcon} 
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: isDestructive ? theme.error : theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.toggleContainer, { backgroundColor: value ? theme.primary : theme.border }]}>
        <View style={[styles.toggleThumb, { backgroundColor: 'white', transform: [{ translateX: value ? 20 : 0 }] }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        {userProfile && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
            <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.profileInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>
                    {userProfile.display_name?.charAt(0)?.toUpperCase() || userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={[styles.profileName, { color: theme.text }]}>
                    {userProfile.display_name || userProfile.username}
                  </Text>
                  <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                    {userProfile.email}
                  </Text>
                  {userProfile.articles_read && (
                    <Text style={[styles.profileStats, { color: theme.textSecondary }]}>
                      {userProfile.articles_read} articles read
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        {renderSettingItem({
          icon: isDarkMode ? 'moon' : 'sunny',
          title: 'Theme',
          subtitle: isDarkMode ? 'Dark Mode' : 'Light Mode',
          onPress: toggleTheme,
          showArrow: false,
        })}

        {/* Notifications */}
        {userProfile?.preferences?.notification_settings && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
            {renderToggleItem({
              icon: 'notifications-outline',
              title: 'Push Notifications',
              subtitle: 'Receive notifications on your device',
              value: userProfile.preferences.notification_settings.push_enabled,
              onToggle: () => toggleNotificationSetting('push_enabled'),
            })}
            {renderToggleItem({
              icon: 'mail-outline',
              title: 'Email Digest',
              subtitle: 'Daily summary of top stories',
              value: userProfile.preferences.notification_settings.email_digest,
              onToggle: () => toggleNotificationSetting('email_digest'),
            })}
            {renderToggleItem({
              icon: 'flash-outline',
              title: 'Breaking News',
              subtitle: 'Immediate alerts for important news',
              value: userProfile.preferences.notification_settings.breaking_news,
              onToggle: () => toggleNotificationSetting('breaking_news'),
            })}
          </>
        )}

        {/* Content Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Content Preferences</Text>
        
        {/* Content Type */}
        <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.settingLeft}>
            <Icon name="newspaper-outline" size={24} color={theme.primary} style={styles.settingIcon} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Content Type</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                {userProfile?.preferences?.content_type === 'articles' ? 'Articles only' :
                 userProfile?.preferences?.content_type === 'videos' ? 'Videos only' : 'Mixed content'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>

        {/* Language */}
        <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.settingLeft}>
            <Icon name="language-outline" size={24} color={theme.primary} style={styles.settingIcon} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Language</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                {userProfile?.preferences?.language === 'en' ? 'English' :
                 userProfile?.preferences?.language === 'es' ? 'Spanish' :
                 userProfile?.preferences?.language === 'fr' ? 'French' :
                 userProfile?.preferences?.language || 'English'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>

        {/* Categories */}
        {userProfile?.preferences?.categories && (
          <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.settingLeft}>
              <Icon name="list-outline" size={24} color={theme.primary} style={styles.settingIcon} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Categories</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  {userProfile.preferences.categories.length} selected
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        )}

        {/* Cache Management */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage</Text>
        {cacheStats && (
          <View style={[styles.cacheStats, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cacheStatsTitle, { color: theme.text }]}>Cache Statistics</Text>
            <View style={styles.cacheStatsGrid}>
              <View style={styles.cacheStatItem}>
                <Text style={[styles.cacheStatNumber, { color: theme.primary }]}>{cacheStats.feeds}</Text>
                <Text style={[styles.cacheStatLabel, { color: theme.textSecondary }]}>Feeds</Text>
              </View>
              <View style={styles.cacheStatItem}>
                <Text style={[styles.cacheStatNumber, { color: theme.primary }]}>{cacheStats.articles}</Text>
                <Text style={[styles.cacheStatLabel, { color: theme.textSecondary }]}>Articles</Text>
              </View>
              <View style={styles.cacheStatItem}>
                <Text style={[styles.cacheStatNumber, { color: theme.primary }]}>{cacheStats.bookmarks}</Text>
                <Text style={[styles.cacheStatLabel, { color: theme.textSecondary }]}>Bookmarks</Text>
              </View>
            </View>
          </View>
        )}
        
        {renderSettingItem({
          icon: 'refresh-outline',
          title: 'Refresh Settings',
          subtitle: 'Manually refresh profile and cache',
          onPress: handleRefresh,
        })}

        {renderSettingItem({
          icon: 'trash-outline',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          onPress: handleClearCache,
        })}

        {/* About */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        {renderSettingItem({
          icon: 'information-circle-outline',
          title: 'Version',
          subtitle: '1.0.0',
          onPress: () => {},
        })}

        {/* Data Usage */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Data & Privacy</Text>
        {renderSettingItem({
          icon: 'shield-checkmark-outline',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          onPress: () => {
            Alert.alert('Privacy Policy', 'Our privacy policy ensures your data is protected and never shared with third parties.');
          },
        })}
        
        {renderSettingItem({
          icon: 'document-text-outline',
          title: 'Terms of Service',
          subtitle: 'App usage terms and conditions',
          onPress: () => {
            Alert.alert('Terms of Service', 'By using this app, you agree to our terms of service and community guidelines.');
          },
        })}

        {renderSettingItem({
          icon: 'analytics-outline',
          title: 'Data Usage',
          subtitle: 'Manage your data preferences',
          onPress: () => {
            Alert.alert('Data Usage', 'This app uses local processing for recommendations to protect your privacy. No personal data is sent to our servers.');
          },
        })}

        {/* Account Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        {renderSettingItem({
          icon: 'person-outline',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => {
            // TODO: Navigate to profile edit screen
            Alert.alert('Coming Soon', 'Profile editing will be available in the next update');
          },
        })}
        
        {renderSettingItem({
          icon: 'shield-outline',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          onPress: () => {
            // TODO: Navigate to privacy settings screen
            Alert.alert('Coming Soon', 'Privacy settings will be available in the next update');
          },
        })}

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Icon 
                name="log-out-outline" 
                size={24} 
                color={theme.error} 
                style={styles.settingIcon} 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.error }]}>
                  {loading ? 'Logging out...' : 'Logout'}
                </Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Sign out of your account
                </Text>
              </View>
            </View>
            {loading ? (
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="small" color={theme.error} />
              </View>
            ) : (
              <Icon name="chevron-forward" size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 20,
    textTransform: 'uppercase',
    fontFamily: 'Inter-SemiBold',
  },
  profileCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  profileStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggleContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  cacheStats: {
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  cacheStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Inter-SemiBold',
  },
  cacheStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cacheStatItem: {
    alignItems: 'center',
  },
  cacheStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  cacheStatLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  logoutContainer: {
    marginTop: 20,
  },
  loadingSpinner: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});

export default UserSettings;
