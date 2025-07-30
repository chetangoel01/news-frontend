
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SwipableCardStack from './SwipableCardStack';

const DUMMY_DATA = [
  { id: '1', text: 'Card 1', backgroundColor: '#FFC300' },
  { id: '2', text: 'Card 2', backgroundColor: '#FF5733' },
  { id: '3', text: 'Card 3', backgroundColor: '#C70039' },
  { id: '4', text: 'Card 4', backgroundColor: '#900C3F' },
  { id: '5', text: 'Card 5', backgroundColor: '#581845' },
];

const Card = ({ item }) => (
  <View style={[styles.card, { backgroundColor: item.backgroundColor }]}>
    <Text style={styles.text}>{item.text}</Text>
  </View>
);

const CardStackExample = () => {
  return (
    <View style={styles.container}>
      <SwipableCardStack
        data={DUMMY_DATA}
        renderItem={({ item }) => <Card item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CardStackExample;
