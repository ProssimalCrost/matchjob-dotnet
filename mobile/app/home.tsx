import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { StarRating } from '@/src/shared/components/StarRating';
import { Loading } from '@/src/shared/components/Loading';
import { getProfessionals } from '@/src/services/professionalService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Professional } from '@/src/types/professional';

const QUICK_ACTIONS = [
  { label: 'Profissionais', icon: 'search' as const, href: '/professionals', colorClass: 'bg-primary/20', iconColor: '#7c3aed' },
  { label: 'Favoritos', icon: 'heart' as const, href: '/favorites', colorClass: 'bg-red-500/20', iconColor: '#ef4444' },
  { label: 'Mensagens', icon: 'chatbubble' as const, href: '/messages', colorClass: 'bg-teal-400/20', iconColor: '#2dd4bf' },
  { label: 'Pedidos', icon: 'briefcase' as const, href: '/requests', colorClass: 'bg-amber-400/20', iconColor: '#f59e0b' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfessionals({ PageSize: 6, Available: true })
      .then((res) => setFeatured(res.Data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.Name?.split(' ')[0] ?? 'Usuário';

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="px-5 pb-5 bg-slate-950 border-b border-slate-800"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-xl font-bold">Olá, {firstName} 👋</Text>
              <Text className="text-slate-400 text-sm mt-0.5">Encontre o profissional ideal</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center"
            >
              <Ionicons name="settings-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <TouchableOpacity
            className="flex-row items-center gap-2.5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 mt-4"
            onPress={() => router.push('/professionals')}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={16} color="#64748b" />
            <Text className="text-slate-500 text-sm flex-1">Buscar profissional, categoria...</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View className="px-5 mt-6 mb-6">
          <Text className="text-white text-base font-bold mb-3">Acesso rápido</Text>
          <View className="flex-row justify-between">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                className="items-center gap-1.5"
                onPress={() => router.push(action.href as any)}
              >
                <View className={`w-14 h-14 rounded-2xl ${action.colorClass} items-center justify-center`}>
                  <Ionicons name={action.icon} size={24} color={action.iconColor} />
                </View>
                <Text className="text-slate-400 text-[11px] font-medium">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured professionals */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-white text-base font-bold">Profissionais em destaque</Text>
            <TouchableOpacity onPress={() => router.push('/professionals')}>
              <Text className="text-primary text-sm font-semibold">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Loading fullscreen={false} />
          ) : (
            <FlatList
              data={featured}
              keyExtractor={(p) => p.Id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/professionals/${item.Id}` as any)}
                  activeOpacity={0.85}
                >
                  <Card className="w-36 p-3.5 items-center gap-1.5">
                    <View className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 items-center justify-center overflow-hidden">
                      {item.AvatarUrl ? (
                        <Image source={{ uri: item.AvatarUrl }} className="w-full h-full" />
                      ) : (
                        <Text className="text-xl font-bold text-primary">
                          {item.UserName?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text className="text-sm font-semibold text-white text-center" numberOfLines={1}>
                      {item.UserName}
                    </Text>
                    <Text className="text-[11px] text-slate-400 text-center" numberOfLines={1}>
                      {item.Title ?? item.Category}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <StarRating rating={item.Rating} size={12} />
                      <Text className="text-[11px] text-slate-500">({item.ReviewCount})</Text>
                    </View>
                    {item.PriceRange && (
                      <Text className="text-xs text-primary font-semibold">{item.PriceRange}</Text>
                    )}
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}
