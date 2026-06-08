import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { Loading } from '@/src/shared/components/Loading';
import {
  getFavorites,
  removeFavorite,
} from '@/src/features/favorites/services/favoriteService';
import type { Professional } from '@/src/features/professionals/types/professionalTypes';
import { Colors } from '@/src/shared/constants/colors';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: string) {
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.Id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
        <Sidebar />
        <Loading message="Carregando favoritos..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: Colors.text }} className="text-3xl font-bold">
          Favoritos
        </Text>
        <Text style={{ color: Colors.textMuted }} className="mb-6 mt-1 text-sm">
          Profissionais que você salvou.
        </Text>

        {favorites.length === 0 ? (
          <View
            style={{ backgroundColor: Colors.surface, borderColor: Colors.slate300 }}
            className="items-center rounded-3xl border border-dashed p-12"
          >
            <Ionicons name="heart-outline" size={48} color={Colors.slate200} />
            <Text style={{ color: Colors.text }} className="mt-4 text-lg font-bold">
              Nenhum favorito ainda
            </Text>
            <Text style={{ color: Colors.textMuted }} className="mt-2 text-center text-sm">
              Explore profissionais e salve seus favoritos.
            </Text>
            <Pressable
              onPress={() => router.push('/professionals')}
              style={{ backgroundColor: Colors.primary }}
              className="mt-6 rounded-xl px-6 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                Explorar profissionais
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-5">
            {favorites.map((p) => (
              <View
                key={p.Id}
                style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
                className="rounded-3xl border p-6"
              >
                <View className="flex-row items-start gap-4">
                  <View
                    style={{ backgroundColor: Colors.primary }}
                    className="h-14 w-14 items-center justify-center rounded-2xl"
                  >
                    <Text className="text-xl font-bold text-white">
                      {p.UserName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.text }} className="font-bold" numberOfLines={1}>
                      {p.UserName}
                    </Text>
                    {!!p.Title && (
                      <Text style={{ color: Colors.primary }} className="text-sm" numberOfLines={1}>
                        {p.Title}
                      </Text>
                    )}
                    <Text style={{ color: Colors.slate400 }} className="text-xs">
                      {p.Category}
                    </Text>
                    {!!p.Location && (
                      <View className="mt-1 flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={12} color={Colors.slate400} />
                        <Text style={{ color: Colors.slate400 }} className="text-xs">
                          {p.Location}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable onPress={() => handleRemove(p.Id)} hitSlop={8} className="p-2">
                    <Ionicons name="heart" size={20} color={Colors.red} />
                  </Pressable>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={16} color={Colors.star} />
                    <Text style={{ color: Colors.star }} className="text-sm">
                      {p.Rating.toFixed(1)} ({p.ReviewCount})
                    </Text>
                  </View>
                  <Text
                    style={{ color: p.Available ? Colors.green : Colors.slate400 }}
                    className="text-xs font-medium"
                  >
                    {p.Available ? 'Disponível' : 'Ocupado'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push(`/professionals/${p.Id}`)}
                  style={{ backgroundColor: Colors.slate950 }}
                  className="mt-4 rounded-2xl py-2.5"
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    Ver perfil
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
