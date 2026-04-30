import { RatingStars } from "../../../reviews/presentation/components/RatingStars";
import { Text, View } from "react-native";

export function ProfessionalCard({ professional }: any) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow mb-4">
      <Text className="text-lg font-bold text-gray-900">
        {professional.name}
      </Text>

      <Text className="text-gray-600">
        {professional.title}
      </Text>

      <RatingStars
        rating={professional.averageRating}
        total={professional.totalReviews}
      />

      <Text className="text-purple-600 mt-2">
        {professional.category}
      </Text>
    </View>
  );
}
