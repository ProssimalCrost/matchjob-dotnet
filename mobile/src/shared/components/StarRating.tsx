import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/shared/constants/colors';

export function StarRating({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const Star = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? Colors.star : Colors.slate300}
          />
        );
        if (!onChange) return <View key={star}>{Star}</View>;
        return (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={4}>
            {Star}
          </Pressable>
        );
      })}
    </View>
  );
}
