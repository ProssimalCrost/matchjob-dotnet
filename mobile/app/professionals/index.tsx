import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { Loading } from '@/src/shared/components/Loading';
import { getProfessionals } from '@/src/features/professionals/services/professionalService';
import { getCategories } from '@/src/features/professionals/services/categoryService';
import {
  addFavorite,
  removeFavorite,
} from '@/src/features/favorites/services/favoriteService';
import type { Professional } from '@/src/features/professionals/types/professionalTypes';
import type { Category } from '@/src/features/professionals/types/categoryTypes';
import { Colors } from '@/src/shared/constants/colors';

export default function ProfessionalsScreen() {
  const router = useRouter();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [result, cats] = await Promise.all([
          getProfessionals({ page: 1, pageSize: 50 }),
          getCategories(),
        ]);
        const data = result.Data ?? [];
        setProfessionals(data);
        setTotal(result.Total ?? data.length);
        setCategories(cats);
      } catch (error) {
        console.error(error);
        setProfessionals([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredProfessionals = useMemo(
    () => [...professionals].sort((a, b) => b.Rating - a.Rating).slice(0, 6),
    [professionals],
  );

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((p) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.UserName?.toLowerCase().includes(s) ||
        p.Title?.toLowerCase().includes(s) ||
        p.Bio?.toLowerCase().includes(s) ||
        p.Category?.toLowerCase().includes(s) ||
        p.Location?.toLowerCase().includes(s) ||
        p.Tags?.some((t) => t.Name.toLowerCase().includes(s));

      const matchesCategory =
        !selectedCategoryId || p.CategoryId === selectedCategoryId;
      const matchesRating = !minRating || p.Rating >= Number(minRating);

      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [professionals, search, selectedCategoryId, minRating]);

  async function toggleFavorite(id: string) {
    try {
      if (favoriteIds.has(id)) {
        await removeFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addFavorite(id);
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
    } catch {
      // silently ignore auth errors on the listing page
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
        <Sidebar />
        <Loading message="Carregando profissionais..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Hero */}
        <View
          style={{ backgroundColor: Colors.slate950 }}
          className="mb-6 overflow-hidden rounded-3xl px-6 py-7"
        >
          <View
            style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(139,92,246,0.1)' }}
            className="mb-4 flex-row items-center gap-2 rounded-full px-4 py-2"
          >
            <Ionicons name="sparkles" size={14} color={Colors.primaryLight} />
            <Text style={{ color: Colors.primaryLight }} className="text-xs font-medium">
              Profissionais autônomos confiáveis
            </Text>
          </View>

          <Text className="text-3xl font-bold text-white">
            Contrate o profissional certo para o seu serviço.
          </Text>
          <Text style={{ color: Colors.slate300 }} className="mt-4 text-base">
            Busque por área, localização, tags e avaliações.
          </Text>

          <View
            style={{ backgroundColor: Colors.white }}
            className="mt-6 flex-row items-center gap-3 rounded-2xl p-2"
          >
            <Ionicons
              name="search"
              size={20}
              color={Colors.slate400}
              style={{ marginLeft: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Busque por dev, designer, eletricista..."
              placeholderTextColor={Colors.slate400}
              style={{ flex: 1, color: Colors.text, paddingVertical: 8 }}
            />
          </View>
        </View>

        {/* Stats */}
        <View className="mb-8 flex-row gap-3">
          <View
            style={{ backgroundColor: Colors.slate950 }}
            className="flex-1 rounded-3xl p-5"
          >
            <Text style={{ color: Colors.slate400 }} className="text-xs">
              Cadastrados
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">{total}</Text>
          </View>
          <View
            style={{ backgroundColor: Colors.slate950 }}
            className="flex-1 rounded-3xl p-5"
          >
            <Text style={{ color: Colors.slate400 }} className="text-xs">
              Categorias
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {categories.length}
            </Text>
          </View>
          <View
            style={{ backgroundColor: Colors.slate950 }}
            className="flex-1 rounded-3xl p-5"
          >
            <Text style={{ color: Colors.slate400 }} className="text-xs">
              Resultados
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {filteredProfessionals.length}
            </Text>
          </View>
        </View>

        {/* Featured */}
        {featuredProfessionals.length > 0 && (
          <View className="mb-8">
            <Text style={{ color: Colors.text }} className="mb-4 text-2xl font-bold">
              Em destaque
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredProfessionals}
              keyExtractor={(p) => `feat-${p.Id}`}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              renderItem={({ item: p }) => (
                <Pressable
                  onPress={() => router.push(`/professionals/${p.Id}`)}
                  style={{ width: 220, backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
                  className="rounded-3xl border p-5"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: Colors.primary }}
                      className="h-12 w-12 items-center justify-center rounded-2xl"
                    >
                      <Text className="text-lg font-bold text-white">
                        {p.UserName?.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.text }} className="text-sm font-bold" numberOfLines={1}>
                        {p.UserName}
                      </Text>
                      <Text style={{ color: Colors.primary }} className="text-xs" numberOfLines={1}>
                        {p.Title || p.Category}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="star" size={14} color={Colors.star} />
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
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Filters */}
        <View
          style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
          className="mb-6 rounded-3xl border p-5"
        >
          <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
            Categoria
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              <CategoryChip
                label="Todas"
                active={selectedCategoryId === ''}
                onPress={() => setSelectedCategoryId('')}
              />
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.Id}
                  label={cat.Name}
                  active={selectedCategoryId === cat.Id}
                  onPress={() => setSelectedCategoryId(cat.Id)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
            Avaliação mínima
          </Text>
          <View className="flex-row gap-2">
            {[
              { v: '', l: 'Todas' },
              { v: '3', l: '3+' },
              { v: '4', l: '4+' },
              { v: '4.5', l: '4.5+' },
            ].map((opt) => (
              <CategoryChip
                key={opt.v}
                label={opt.l}
                active={minRating === opt.v}
                onPress={() => setMinRating(opt.v)}
              />
            ))}
          </View>
        </View>

        {/* Grid */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text style={{ color: Colors.text }} className="text-2xl font-bold">
            Todos
          </Text>
          <Text style={{ color: Colors.textMuted }} className="text-sm">
            {filteredProfessionals.length} resultado(s)
          </Text>
        </View>

        {filteredProfessionals.length === 0 ? (
          <View
            style={{ backgroundColor: Colors.surface, borderColor: Colors.slate300 }}
            className="items-center rounded-3xl border border-dashed p-10"
          >
            <Text style={{ color: Colors.text }} className="text-lg font-bold">
              Nenhum profissional encontrado
            </Text>
            <Text style={{ color: Colors.textMuted }} className="mt-2 text-center text-sm">
              Tente outros filtros ou termos de busca.
            </Text>
          </View>
        ) : (
          <View className="gap-5">
            {filteredProfessionals.map((p) => (
              <ProfessionalCard
                key={p.Id}
                professional={p}
                isFavorite={favoriteIds.has(p.Id)}
                onToggleFavorite={() => toggleFavorite(p.Id)}
                onView={() => router.push(`/professionals/${p.Id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? Colors.primary : Colors.surface,
        borderColor: active ? Colors.primary : Colors.slate200,
      }}
      className="rounded-full border px-4 py-2"
    >
      <Text
        style={{ color: active ? Colors.white : Colors.textSecondary }}
        className="text-sm font-medium"
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProfessionalCard({
  professional: p,
  isFavorite,
  onToggleFavorite,
  onView,
}: {
  professional: Professional;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onView: () => void;
}) {
  return (
    <View
      style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
      className="rounded-3xl border p-6"
    >
      <View className="flex-row items-start gap-4">
        <View
          style={{ backgroundColor: Colors.primary }}
          className="h-16 w-16 items-center justify-center rounded-2xl"
        >
          <Text className="text-2xl font-bold text-white">
            {p.UserName?.charAt(0) || '?'}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.text }} className="text-lg font-bold" numberOfLines={1}>
            {p.UserName}
          </Text>
          {!!p.Title && (
            <Text style={{ color: Colors.primary700 }} className="text-sm font-medium" numberOfLines={1}>
              {p.Title}
            </Text>
          )}
          <Text style={{ color: Colors.textMuted }} className="mt-0.5 text-xs font-medium">
            {p.Category}
          </Text>
          {!!p.Location && (
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color={Colors.slate400} />
              <Text style={{ color: Colors.slate400 }} className="text-sm">
                {p.Location}
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={onToggleFavorite} hitSlop={8} className="p-2">
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? Colors.red : Colors.slate300}
          />
        </Pressable>
      </View>

      {!!p.Bio && (
        <Text style={{ color: Colors.textMuted }} className="mt-4 text-sm leading-6" numberOfLines={2}>
          {p.Bio}
        </Text>
      )}

      <View className="mt-4 flex-row gap-3">
        <View style={{ backgroundColor: Colors.slate100, flex: 1 }} className="rounded-2xl p-3">
          <Text style={{ color: Colors.slate400 }} className="text-xs">
            Avaliação
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="star" size={16} color={Colors.star} />
            <Text style={{ color: Colors.text }} className="text-sm font-bold">
              {p.Rating.toFixed(1)}
            </Text>
            <Text style={{ color: Colors.slate400 }} className="text-xs">
              ({p.ReviewCount})
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: Colors.slate100, flex: 1 }} className="rounded-2xl p-3">
          <Text style={{ color: Colors.slate400 }} className="text-xs">
            Status
          </Text>
          <Text
            style={{ color: p.Available ? Colors.green : Colors.slate400 }}
            className="mt-1 text-sm font-bold"
          >
            {p.Available ? 'Disponível' : 'Ocupado'}
          </Text>
        </View>
      </View>

      {p.Tags.length > 0 && (
        <View className="mt-4 flex-row flex-wrap gap-1.5">
          {p.Tags.slice(0, 4).map((tag) => (
            <View
              key={tag.Id}
              style={{ backgroundColor: Colors.primary50, borderColor: Colors.primary100 }}
              className="flex-row items-center gap-1 rounded-full border px-2.5 py-0.5"
            >
              <Ionicons name="pricetag" size={10} color={Colors.primary700} />
              <Text style={{ color: Colors.primary700 }} className="text-xs font-medium">
                {tag.Name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={onView}
        style={{ backgroundColor: Colors.slate950 }}
        className="mt-5 rounded-2xl py-3"
      >
        <Text className="text-center text-sm font-semibold text-white">Ver perfil</Text>
      </Pressable>
    </View>
  );
}
