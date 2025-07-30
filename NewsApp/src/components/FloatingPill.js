import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

const ACTIONS = [
  { name: 'bookmark', icon: 'bookmark-outline' },
  { name: 'share', icon: 'share-outline' },
  { name: 'text-size', icon: 'text-outline' },
  { name: 'comments', icon: 'chatbubble-outline' },
  { name: 'account', icon: 'person-circle-outline' },
];

const FloatingPill = ({ article, isVisible, onBookmark, onShare, onTextSize, onComments, onAccount }) => {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(50)).current;
  const actionAnims = useRef(ACTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = [
      Animated.timing(heightAnim, {
        toValue: expanded ? 50 + ACTIONS.length * 50 : 50,
        duration: 300,
        useNativeDriver: false,
      }),
      ...actionAnims.map((anim, index) => 
        Animated.timing(anim, {
          toValue: expanded ? 1 : 0,
          duration: 200,
          delay: expanded ? index * 50 : 0,
          useNativeDriver: true,
        })
      ),
    ];
    Animated.parallel(animations).start();
  }, [expanded]);

  const handlePress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(false);
    switch (action.name) {
      case 'bookmark': onBookmark && onBookmark(article); break;
      case 'share': onShare && onShare(article); break;
      case 'text-size': onTextSize && onTextSize(article); break;
      case 'comments': onComments && onComments(article); break;
      case 'account': onAccount && onAccount(); break;
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.pill, { height: heightAnim }]}>
      <BlurView style={StyleSheet.absoluteFill} tint="dark" intensity={80} />
      <TouchableWithoutFeedback onPress={() => setExpanded((e) => !e)}>
        <View style={styles.mainIconContainer}>
          <Icon name={expanded ? 'close-outline' : 'ellipsis-horizontal'} size={28} color="#E5E5E7" />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.actionsContainer}>
        {ACTIONS.map((action, index) => (
          <Animated.View
            key={action.name}
            style={{
              opacity: actionAnims[index],
              transform: [{
                translateY: actionAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                  extrapolate: 'clamp',
                }),
              }],
            }}
          >
            <TouchableOpacity onPress={() => handlePress(action)} style={styles.actionButton}>
              <Icon name={action.icon} size={24} color="#E5E5E7" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  mainIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
});

export default FloatingPill;