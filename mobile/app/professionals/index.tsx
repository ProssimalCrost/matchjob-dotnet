import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
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
import { Colors } from '@/src/shared/constants/colors';
import { getProfessionals } from '@/src/services/professionalService';
import { getCategories } from '@/src/services/categoryService';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import type { Professional } from '@/src/types/professional';
import type { Category } from '@/src/types/category';

export default function ProfessionalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadProfessionals = useCallback(
    async (currentPage = 1, replace = true) => {
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
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, selectedCategory],
  );

  useEffect(() => {
    loadProfessionals(1, true);
  }, [loadProfessionals]);

  function handleRefresh() {
    setRefreshing(true);
    loadProfessionals(1, true);
  }

  function handleLoadMore() {
    if (!loading && page < totalPages) {
      loadProfessionals(page + 1, false);
    }
  }

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Profissionais</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profissional..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={[{ Id: '', Name: 'Todos' } as Category, ...categories]}
        keyExtractor={(c) => c.Id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, item.Id === selectedCategory && styles.catChipActive]}
            onPress={() => setSelectedCategory(item.Id)}
          >
            <Text style={[styles.catText, item.Id === selectedCategory && styles.catTextActive]}>
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
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && professionals.length > 0 ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => router.push(`/professionals/${item.Id}` as any)}
            activeOpacity={0.85}
          >
            <Card style={styles.card}>
              <View style={styles.avatar}>
                {item.AvatarUrl ? (
                  <Image source={{ uri: item.AvatarUrl }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitial}>{item.UserName?.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              {!item.Available && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Indisponível</Text>
                </View>
              )}
              <Text style={styles.name} numberOfLines={1}>{item.UserName}</Text>
              <Text style={styles.category} numberOfLines={1}>{item.Title ?? item.Category}</Text>
              <StarRating rating={item.Rating} size={13} />
              <Text style={styles.reviews}>{item.ReviewCount} avaliações</Text>
              {item.PriceRange && <Text style={styles.price}>{item.PriceRange}</Text>}
            </Card>
          </TouchableOpacity>
        )}
      />

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textOnPrimary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: Colors.text },
  categoryList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: Colors.textOnPrimary },
  list: { padding: 12, paddingBottom: 16 },
  row: { gap: 12 },
  cardWrapper: { flex: 1 },
  card: { padding: 14, alignItems: 'center', gap: 6, flex: 1 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  unavailableBadge: {
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unavailableText: { fontSize: 10, color: Colors.error, fontWeight: '600' },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  category: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  reviews: { fontSize: 11, color: Colors.textMuted },
  price: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
