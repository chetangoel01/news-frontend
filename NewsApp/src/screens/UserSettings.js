import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Switch,
  Dimensions,
  SafeAreaView,
  Modal,
  FlatList,
  TextInput,
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import articleService from '../services/articleService';
import authService from '../services/authService';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const UserSettings = ({ navigation, onLogout }) => {
  const { theme, isDarkMode, themeMode, setThemeMode, THEME_MODES } = useTheme();
  const [cacheStats, setCacheStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    display_name: '',
    email: '',
    profile_image: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

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
      // Initialize form with current values
      setEditForm({
        display_name: profile?.display_name || '',
        email: profile?.email || '',
        profile_image: profile?.profile_image || ''
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
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
              await loadCacheStats();
            } catch (error) {
              console.error('Failed to clear cache:', error);
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
              await onLogout();
            } catch (error) {
              console.error('Logout failed:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const cycleTheme = () => {
    const themeOrder = [THEME_MODES.LIGHT, THEME_MODES.DARK, THEME_MODES.AUTO];
    const currentIndex = themeOrder.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setThemeMode(themeOrder[nextIndex]);
  };

  const getThemeDisplayText = () => {
    switch (themeMode) {
      case THEME_MODES.LIGHT:
        return 'Light';
      case THEME_MODES.DARK:
        return 'Dark';
      case THEME_MODES.AUTO:
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case THEME_MODES.LIGHT:
        return 'sunny';
      case THEME_MODES.DARK:
        return 'moon';
      case THEME_MODES.AUTO:
        return 'settings';
      default:
        return 'settings';
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setEditForm(prev => ({ ...prev, profile_image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    setEditForm(prev => ({ ...prev, profile_image: '' }));
  };

  const handleUpdateProfile = async () => {
    if (!editForm.display_name.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setUpdatingProfile(true);
    try {
      await authService.updateProfile({
        display_name: editForm.display_name.trim(),
        email: editForm.email.trim(),
        profile_image: editForm.profile_image
      });
      await loadUserProfile();
      setShowEditProfileModal(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!passwordForm.new_password.trim() || passwordForm.new_password.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setUpdatingProfile(true);
    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setShowChangePasswordModal(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const renderSettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    isDestructive = false,
    badge,
    disabled = false 
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.cardBackground,
          opacity: disabled ? 0.6 : 1
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={isDestructive ? theme.error : theme.primary} 
          style={styles.settingIcon} 
        />
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle, 
            { color: isDestructive ? theme.error : theme.text }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showArrow && <Icon name="chevron-forward" size={20} color={theme.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const renderToggleItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    isDestructive = false,
    disabled = false 
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.cardBackground,
          opacity: disabled ? 0.6 : 1
        }
      ]}
      onPress={onToggle}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={isDestructive ? theme.error : theme.primary} 
          style={styles.settingIcon} 
        />
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle, 
            { color: isDestructive ? theme.error : theme.text }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        disabled={disabled}
      />
    </TouchableOpacity>
  );

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfileModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEditProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfileModal(false)} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Display Name</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={editForm.display_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, display_name: text }))}
                placeholder="Enter your display name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={editForm.email}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Profile Image</Text>
              <View style={styles.imageSection}>
                {editForm.profile_image ? (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: editForm.profile_image }} 
                      style={styles.profileImage} 
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={removeImage}
                    >
                      <Icon name="close-circle" size={20} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.addImageButton, { 
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border 
                    }]}
                    onPress={pickImage}
                  >
                    <Icon name="camera" size={24} color={theme.primary} />
                    <Text style={[styles.addImageText, { color: theme.textSecondary }]}>
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderChangePasswordModal = () => (
    <Modal
      visible={showChangePasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowChangePasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowChangePasswordModal(false)} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Current Password</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={passwordForm.current_password}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, current_password: text }))}
                placeholder="Enter current password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>New Password</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={passwordForm.new_password}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, new_password: text }))}
                placeholder="Enter new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                value={passwordForm.confirm_password}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirm_password: text }))}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleChangePassword}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        {userProfile && (
          <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.profileInfo}>
              {userProfile.profile_image ? (
                <Image 
                  source={{ uri: userProfile.profile_image }} 
                  style={styles.profileAvatar} 
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>
                    {userProfile.display_name?.charAt(0)?.toUpperCase() || 
                     userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
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
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: theme.cardBackground }]}
            onPress={cycleTheme}
          >
            <Icon 
              name={getThemeIcon()} 
              size={24} 
              color={theme.primary} 
            />
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              {getThemeDisplayText()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Icon name="bookmark" size={24} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              Bookmarks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Icon name="compass" size={24} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              Discover
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Settings</Text>
          
          {renderSettingItem({
            icon: 'person-outline',
            title: 'Edit Profile',
            subtitle: 'Update your name and email',
            onPress: () => setShowEditProfileModal(true),
          })}
          
          {renderSettingItem({
            icon: 'lock-closed-outline',
            title: 'Change Password',
            subtitle: 'Update your password',
            onPress: () => setShowChangePasswordModal(true),
          })}
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage</Text>
          
          {renderSettingItem({
            icon: 'trash-outline',
            title: 'Clear Cache',
            subtitle: 'Free up storage space',
            onPress: handleClearCache,
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          
          {renderSettingItem({
            icon: 'information-circle-outline',
            title: 'Version',
            subtitle: '1.0.0',
            onPress: () => {},
            showArrow: false,
          })}
          
          {renderSettingItem({
            icon: 'help-circle-outline',
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
            onPress: () => {},
          })}
          
          {renderSettingItem({
            icon: 'star-outline',
            title: 'Rate App',
            subtitle: 'Rate us on the App Store',
            onPress: () => {},
          })}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <Icon 
              name="log-out-outline" 
              size={20} 
              color="white" 
              style={styles.logoutIcon} 
            />
            <Text style={styles.logoutText}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
            {loading && (
              <ActivityIndicator size="small" color="white" style={styles.logoutSpinner} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      {renderEditProfileModal()}

      {/* Change Password Modal */}
      {renderChangePasswordModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
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
  },
  scrollContent: {
    paddingBottom: 60,
  },
  profileCard: {
    borderRadius: 15,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
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
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  logoutContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  logoutSpinner: {
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  // Profile image styles
  imageSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});

export default UserSettings;
