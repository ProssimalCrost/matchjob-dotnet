// src/features/professionals/screens/HomeScreen.tsx

import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useProfessionals } from "../hooks/useProfessionals";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { SearchInput } from "../components/SearchInput";

export function HomeScreen() {
  const { professionals, search, setSearch, isLoading, error } = useProfessionals();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="text-brand-200 mt-3">Carregando profissionais...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-14">
      <Text className="text-white text-3xl font-bold">MatchJob</Text>

      <Text className="text-brand-200 mt-1 mb-6">
        Encontre profissionais autônomos perto de você
      </Text>

      <SearchInput value={search} onChange={setSearch} />

      {error && <Text className="text-red-400 mb-4">{error}</Text>}

      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfessionalCard profissional={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}