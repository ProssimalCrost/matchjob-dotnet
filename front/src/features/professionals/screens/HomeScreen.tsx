import { Text, View } from "react-native";

export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-white text-2xl font-bold">
        MatchJob
      </Text>

      <Text className="text-brand-200 mt-2">
        Encontre profissionais autônomos
      </Text>
    </View>
  );
}