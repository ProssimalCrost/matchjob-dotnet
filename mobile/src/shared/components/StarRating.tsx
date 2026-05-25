import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, maxStars = 5, size = 18, onRate, readonly = true }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        const star = filled ? 'star' : 'star-outline';
        return readonly ? (
          <Ionicons key={i} name={star} size={size} color={Colors.star} />
        ) : (
          <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)}>
            <Ionicons name={star} size={size} color={Colors.star} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
