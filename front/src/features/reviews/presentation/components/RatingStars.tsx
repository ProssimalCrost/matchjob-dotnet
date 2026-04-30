import { Text, View } from "react-native";

type Props = {
  rating: number;
  total?: number;
};

export function RatingStars({ rating, total }: Props) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-yellow-400">
        {"*".repeat(rounded)}
        {"-".repeat(5 - rounded)}
      </Text>

      <Text className="text-gray-500 text-sm">
        {rating > 0 ? rating.toFixed(1) : "0.0"}
        {total !== undefined && ` (${total})`}
      </Text>
    </View>
  );
}
