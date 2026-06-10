import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
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

  function getRole(conv: Conversation): string {
    if (!user) return '';
    return user.UserId === conv.ClientId ? 'Profissional' : 'Cliente';
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-950 border-b border-slate-800 px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white text-xl font-bold">Mensagens</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="mt-10" />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.Id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-12 gap-3">
              <Ionicons name="chatbubbles-outline" size={52} color="#334155" />
              <Text className="text-slate-400 text-base font-semibold">Nenhuma conversa ainda</Text>
              <Text className="text-slate-500 text-sm text-center leading-5">
                Vá ao perfil de um profissional e envie uma mensagem
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/messages/${item.Id}` as any)} activeOpacity={0.8}>
              <Card className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 items-center justify-center">
                  <Text className="text-lg font-bold text-primary">
                    {getOtherName(item).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-200 text-[15px] font-semibold">{getOtherName(item)}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">{getRole(item)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <BottomTabBar />
    </View>
  );
}
