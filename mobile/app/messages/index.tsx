import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { Colors } from '@/src/shared/constants/colors';
import { getMyConversations } from '@/src/services/messageService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Conversation } from '@/src/types/message';

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.UserId) return;
    getMyConversations(user.UserId)
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.UserId]);

  function getOtherName(conv: Conversation): string {
    if (!user) return '';
    return user.UserId === conv.ClientId ? conv.ProfessionalName : conv.ClientName;
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Mensagens</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.Id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={52} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
              <Text style={styles.emptySubText}>Vá ao perfil de um profissional e envie uma mensagem</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/messages/${item.Id}` as any)} activeOpacity={0.8}>
              <Card style={styles.convCard}>
                <View style={styles.convAvatar}>
                  <Text style={styles.convInitial}>{getOtherName(item).charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.convInfo}>
                  <Text style={styles.convName}>{getOtherName(item)}</Text>
                  <Text style={styles.convSub}>
                    {user?.UserId === item.ClientId ? 'Profissional' : 'Cliente'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

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
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textOnPrimary },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 8 },
  convCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convInitial: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  convSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  emptySubText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
