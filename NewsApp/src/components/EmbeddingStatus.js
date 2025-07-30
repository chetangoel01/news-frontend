import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import embeddingService from '../services/embeddingService';
import LocalDatabase from '../services/localDatabase';

const EmbeddingStatus = () => {
  const [localStatus, setLocalStatus] = useState(null);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, settingsData, statsData] = await Promise.all([
        embeddingService.getLocalStatus(),
        LocalDatabase.getSettings(),
        LocalDatabase.getInteractionStats(),
      ]);
      
      setLocalStatus(status);
      setSettings(settingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Load embedding data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await embeddingService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Update setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const clearOldData = async () => {
    Alert.alert(
      'Clear Old Data',
      'This will remove interactions older than 30 days. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await embeddingService.clearOldInteractions(30);
              await loadData();
              Alert.alert('Success', 'Old data cleared');
            } catch (error) {
              console.error('Clear old data error:', error);
              Alert.alert('Error', 'Failed to clear old data');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const data = await embeddingService.exportData();
      console.log('Exported data:', data);
      Alert.alert('Success', 'Data exported to console');
    } catch (error) {
      console.error('Export data error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all local interaction data. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await embeddingService.clearData();
              await loadData();
              Alert.alert('Success', 'All data cleared');
            } catch (error) {
              console.error('Clear all data error:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading embedding status...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Local Embedding Status</Text>
      
      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>
            {localStatus?.last_updated ? 
              new Date(localStatus.last_updated).toLocaleString() : 
              'Never'
            }
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Articles Since Update:</Text>
          <Text style={styles.value}>{localStatus?.articles_since_update || 0}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Sync Required:</Text>
          <Text style={[styles.value, { color: localStatus?.sync_required ? '#ff6b6b' : '#51cf66' }]}>
            {localStatus?.sync_required ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Session Active:</Text>
          <Text style={styles.value}>
            {localStatus?.session_active ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Total Interactions:</Text>
          <Text style={styles.value}>{stats?.total || 0}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Recent Activity (24h):</Text>
          <Text style={styles.value}>{stats?.recentActivity || 0}</Text>
        </View>
        
        {/* Interaction Types */}
        <Text style={styles.subsectionTitle}>Interaction Types:</Text>
        {stats?.byType && Object.entries(stats.byType).map(([type, count]) => (
          <View key={type} style={styles.statusItem}>
            <Text style={styles.label}>{type}:</Text>
            <Text style={styles.value}>{count}</Text>
          </View>
        ))}
        
        {/* Categories */}
        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Categories:</Text>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <View key={category} style={styles.statusItem}>
                <Text style={styles.label}>{category}:</Text>
                <Text style={styles.value}>{count}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Update Frequency:</Text>
          <Text style={styles.value}>{settings?.updateFrequency || 10} articles</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Embedding Model:</Text>
          <Text style={styles.value}>{settings?.embeddingModel || 'local'}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Privacy Level:</Text>
          <Text style={styles.value}>{settings?.privacyLevel || 'high'}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Sync Enabled:</Text>
          <Switch
            value={settings?.syncEnabled !== false}
            onValueChange={(value) => updateSetting('syncEnabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings?.syncEnabled !== false ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearOldData}>
          <Text style={styles.buttonText}>Clear Old Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={exportData}>
          <Text style={styles.buttonText}>Export Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllData}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#495057',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonText: {
    color: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#6c757d',
  },
});

export default EmbeddingStatus; 