import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { createReview } from "@/services/reviewService";

type Props = {
  professionalProfileId: string;
  onSuccess?: () => void;
};

export function ReviewForm({ professionalProfileId, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    await createReview({
      professionalProfileId,
      rating,
      comment,
    });

    setComment("");
    setRating(5);
    onSuccess?.();
  }

  return (
    <View className="bg-white rounded-2xl p-4 mt-4">
      <Text className="text-lg font-bold mb-3">Avaliar profissional</Text>

      <View className="flex-row gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} onPress={() => setRating(value)}>
            <Text className="text-3xl">{value <= rating ? "*" : "-"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Escreva um comentario..."
        multiline
        className="border border-gray-300 rounded-xl p-3 min-h-[90px]"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-purple-600 rounded-xl p-3 mt-3"
      >
        <Text className="text-white text-center font-bold">
          Enviar avaliacao
        </Text>
      </TouchableOpacity>
    </View>
  );
}
