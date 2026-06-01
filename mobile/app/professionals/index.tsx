import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { StarRating } from '@/src/shared/components/StarRating';
import { getProfessionals } from '@/src/services/professionalService';
import { getCategories } from '@/src/services/categoryService';
import { getFavorites, addFavorite, removeFavorite } from '@/src/services/favoriteService';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Professional } from '@/src/types/professional';
import type { Category } from '@/src/types/category';

export default function ProfessionalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    if (!user) return;
    getFavorites().then((favs) => setFavoritedIds(new Set(favs.map((f) => f.Id)))).catch(() => {});
  }, [user]);

  const loadProfessionals = useCallback(async (currentPage = 1, replace = true) => {
    setLoading(true);
    try {
      const res = await getProfessionals({
        Search: debouncedSearch || undefined,
        Category: selectedCategory || undefined,
        Page: currentPage,
        PageSize: 12,
      });
      setProfessionals((prev) => replace ? res.Data : [...prev, ...res.Data]);
      setTotalPages(res.TotalPages);
      setPage(currentPage);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => { loadProfessionals(1, true); }, [loadProfessionals]);

  function handleRefresh() { setRefreshing(true); loadProfessionals(1, true); }
  function handleLoadMore() { if (!loading && page < totalPages) loadProfessionals(page + 1, false); }

  async function handleToggleFavorite(professional: Professional) {
    const alreadyFaved = favoritedIds.has(professional.Id);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      alreadyFaved ? next.delete(professional.Id) : next.add(professional.Id);
      return next;
    });
    try {
      alreadyFaved ? await removeFavorite(professional.Id) : await addFavorite(professional.Id);
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        alreadyFaved ? next.add(professional.Id) : next.delete(professional.Id);
        return next;
      });
    }
  }

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-950 border-b border-slate-800 px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white text-xl font-bold mb-3">Profissionais</Text>
        <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-3 gap-2">
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            className="flex-1 h-11 text-sm text-white"
            placeholder="Buscar profissional..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <FlatList
        horizontal
        data={[{ Id: '', Name: 'Todos' } as Category, ...categories]}
        keyExtractor={(c) => c.Id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-3.5 py-1.5 rounded-full border mr-2 ${item.Id === selectedCategory ? 'bg-primary border-primary' : 'bg-slate-800 border-slate-700'}`}
            onPress={() => setSelectedCategory(item.Id)}
          >
            <Text className={`text-[13px] font-medium ${item.Id === selectedCategory ? 'text-white' : 'text-slate-400'}`}>
              {item.Name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      <FlatList
        data={professionals}
        keyExtractor={(p) => p.Id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
        columnWrapperStyle={{ gap: 12 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 items-center justify-center p-12 gap-3">
              <Ionicons name="search-outline" size={48} color="#334155" />
              <Text className="text-slate-500 text-[15px]">Nenhum profissional encontrado</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && professionals.length > 0 ? (
            <ActivityIndicator color="#7c3aed" className="my-4" />
          ) : null
        }
        renderItem={({ item }) => {
          const faved = favoritedIds.has(item.Id);
          return (
            <TouchableOpacity
              className="flex-1"
              onPress={() => router.push(`/professionals/${item.Id}` as any)}
              activeOpacity={0.85}
            >
              <Card className="items-center gap-1.5 p-3.5 flex-1">
                {user && (
                  <TouchableOpacity
                    className="absolute top-2.5 right-2.5 z-10"
                    onPress={() => handleToggleFavorite(item)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Ionicons name={faved ? 'heart' : 'heart-outline'} size={16} color={faved ? '#ef4444' : '#64748b'} />
                  </TouchableOpacity>
                )}
                <View className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 items-center justify-center overflow-hidden">
                  {item.AvatarUrl ? (
                    <Image source={{ uri: item.AvatarUrl }} className="w-full h-full" />
                  ) : (
                    <Text className="text-2xl font-bold text-primary">{item.UserName?.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                {!item.Available && (
                  <View className="bg-red-500/15 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] text-red-400 font-semibold">Indisponível</Text>
                  </View>
                )}
                <Text className="text-[13px] font-semibold text-white text-center" numberOfLines={1}>{item.UserName}</Text>
                <Text className="text-[11px] text-slate-400 text-center" numberOfLines={1}>{item.Title ?? item.Category}</Text>
                <StarRating rating={item.Rating} size={13} />
                <Text className="text-[11px] text-slate-500">{item.ReviewCount} avaliações</Text>
                {item.PriceRange && <Text className="text-xs text-primary font-semibold">{item.PriceRange}</Text>}
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <BottomTabBar />
    </View>
  );
}
