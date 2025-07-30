import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import HorizontalFloatingNavBar from './HorizontalFloatingNavBar';
import { useNavigation } from '@react-navigation/native';

const MainLayout = memo(({ activeRouteName }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <HorizontalFloatingNavBar navigation={navigation} activeRouteName={activeRouteName} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50, // Reduced to avoid gesture conflicts
  },
});

export default MainLayout;
