import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 18,
  onRate,
  readonly = true,
}: Props) {
  return (
    <View className="flex-row gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        const name = filled ? 'star' : 'star-outline';
        return readonly ? (
          <Ionicons key={i} name={name} size={size} color="#f59e0b" />
        ) : (
          <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)} className="p-0.5">
            <Ionicons name={name} size={size} color="#f59e0b" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
