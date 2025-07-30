import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getConfigInfo } from '../config/supabase';

const ConfigTest = () => {
  const [configInfo, setConfigInfo] = useState(null);

  useEffect(() => {
    const info = getConfigInfo();
    setConfigInfo(info);
    console.log('Supabase Config Info:', info);
  }, []);

  if (!configInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Configuration Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>URL Configured:</Text>
        <Text style={[styles.value, { color: configInfo.url ? 'green' : 'red' }]}>
          {configInfo.url ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Anon Key Configured:</Text>
        <Text style={[styles.value, { color: configInfo.anonKeyConfigured ? 'green' : 'red' }]}>
          {configInfo.anonKeyConfigured ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Configuration Valid:</Text>
        <Text style={[styles.value, { color: configInfo.validation.isValid ? 'green' : 'red' }]}>
          {configInfo.validation.isValid ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      {!configInfo.validation.isValid && (
        <View style={styles.section}>
          <Text style={styles.label}>Issues:</Text>
          {configInfo.validation.issues.map((issue, index) => (
            <Text key={index} style={styles.error}>• {issue}</Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Config Source:</Text>
        <Text style={styles.value}>
          {configInfo.source.expoConstants ? 'Expo Constants' : 
           configInfo.source.processEnv ? 'Process.env' : 'Fallback'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    marginBottom: 5,
  },
  error: {
    fontSize: 12,
    color: 'red',
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default ConfigTest; 