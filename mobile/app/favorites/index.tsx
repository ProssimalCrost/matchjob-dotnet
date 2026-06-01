import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { StarRating } from '@/src/shared/components/StarRating';
import { getFavorites, removeFavorite } from '@/src/services/favoriteService';
import type { Professional } from '@/src/types/professional';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getFavorites().then(setFavorites).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleRemove(professional: Professional) {
    Alert.alert('Remover favorito', `Remover ${professional.UserName} dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavorite(professional.Id);
            setFavorites((prev) => prev.filter((p) => p.Id !== professional.Id));
          } catch { Alert.alert('Erro', 'Não foi possível remover o favorito.'); }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-950 border-b border-slate-800 px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white text-xl font-bold">Favoritos</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="mt-10" />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(p) => p.Id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          columnWrapperStyle={favorites.length > 0 ? { gap: 12 } : undefined}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-12 gap-3">
              <Ionicons name="heart-outline" size={52} color="#334155" />
              <Text className="text-slate-400 text-base font-semibold">Nenhum favorito ainda</Text>
              <Text className="text-slate-500 text-sm text-center leading-[18px]">
                Salve profissionais para acessar depois
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-xl px-5 py-3 mt-1"
                onPress={() => router.push('/professionals')}
              >
                <Text className="text-white text-sm font-semibold">Explorar profissionais</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1"
              onPress={() => router.push(`/professionals/${item.Id}` as any)}
              activeOpacity={0.85}
            >
              <Card className="items-center gap-1.5 p-3.5 flex-1">
                <TouchableOpacity
                  className="absolute top-2.5 right-2.5 z-10"
                  onPress={() => handleRemove(item)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons name="heart" size={18} color="#ef4444" />
                </TouchableOpacity>

                <View className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 items-center justify-center overflow-hidden">
                  {item.AvatarUrl
                    ? <Image source={{ uri: item.AvatarUrl }} className="w-full h-full" />
                    : <Text className="text-2xl font-bold text-primary">{item.UserName?.charAt(0).toUpperCase()}</Text>
                  }
                </View>

                {!item.Available && (
                  <View className="bg-red-500/15 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] text-red-400 font-semibold">Indisponível</Text>
                  </View>
                )}

                <Text className="text-[13px] font-semibold text-white text-center" numberOfLines={1}>{item.UserName}</Text>
                <Text className="text-[11px] text-slate-400 text-center" numberOfLines={1}>{item.Title ?? item.Category}</Text>
                <StarRating rating={item.Rating} size={13} />
                {item.PriceRange && <Text className="text-xs text-primary font-semibold">{item.PriceRange}</Text>}

                <View className="bg-primary/15 rounded-lg px-3 py-1 mt-0.5">
                  <Text className="text-[11px] text-primary font-semibold">Ver perfil</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <BottomTabBar />
    </View>
  );
}
