import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
import { Colors } from '@/src/shared/constants/colors';
import { getProfessionals } from '@/src/services/professionalService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Professional } from '@/src/types/professional';

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
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.headerSub}>Encontre o profissional ideal</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search shortcut */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/professionals')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Buscar profissional, categoria...</Text>
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickItem}
                onPress={() => router.push(action.href as any)}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured professionals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profissionais em destaque</Text>
            <TouchableOpacity onPress={() => router.push('/professionals')}>
              <Text style={styles.seeAll}>Ver todos</Text>
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
                  <Card style={styles.proCard}>
                    <View style={styles.avatar}>
                      {item.AvatarUrl ? (
                        <Image source={{ uri: item.AvatarUrl }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarInitial}>
                          {item.UserName?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.proName} numberOfLines={1}>{item.UserName}</Text>
                    <Text style={styles.proTitle} numberOfLines={1}>{item.Title ?? item.Category}</Text>
                    <View style={styles.ratingRow}>
                      <StarRating rating={item.Rating} size={13} />
                      <Text style={styles.ratingCount}>({item.ReviewCount})</Text>
                    </View>
                    {item.PriceRange && (
                      <Text style={styles.price}>{item.PriceRange}</Text>
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

const QUICK_ACTIONS = [
  { label: 'Profissionais', icon: 'search', href: '/professionals', color: Colors.primary },
  { label: 'Mensagens', icon: 'chatbubble', href: '/messages', color: Colors.secondary },
  { label: 'Pedidos', icon: 'briefcase', href: '/requests', color: Colors.warning },
  { label: 'Meu perfil', icon: 'person', href: '/profile', color: Colors.success },
];

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.textOnPrimary },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerBtn: { padding: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  searchPlaceholder: { fontSize: 14, color: Colors.textMuted },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  quickItem: { alignItems: 'center', gap: 6 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  proCard: { width: 150, padding: 14, alignItems: 'center', gap: 6 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  proName: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  proTitle: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingCount: { fontSize: 11, color: Colors.textMuted },
  price: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
