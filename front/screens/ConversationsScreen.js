import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../services/AuthContext';
import { getConversations } from '../services/api';

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ConversationsScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const load = useCallback(async () => {
    try {
      const res = await getConversations(user.UserId);
      setConversations(res.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.UserId]);

  useEffect(() => {
    load();
  }, [load]);

  const otherName = (conv) =>
    user.UserId === conv.ClientId ? conv.ProfessionalName : conv.ClientName;

  const renderItem = ({ item }) => {
    const name = otherName(item);
    const isClient = user.UserId === item.ClientId;

    return (
      <TouchableOpacity
        className="mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm"
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.Id,
            otherName: name,
          })
        }
        activeOpacity={0.85}
      >
        <View
          className="mr-3.5 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor(name) }}
        >
          <Text className="text-lg font-extrabold text-white">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{name}</Text>
          <Text className="mt-1 text-xs text-slate-400">
            {isClient ? 'Voce e o cliente' : 'Voce e o profissional'}
          </Text>
        </View>
        <Text className="text-2xl font-light text-indigo-200">›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-indigo-50">
      <View className="bg-indigo-600 px-5 pb-5 pt-14">
        <Text className="text-2xl font-black text-white">Conversas</Text>
        <Text className="mt-1 text-xs text-indigo-200">{conversations.length} ativa(s)</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderItem}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              colors={['#4f46e5']}
            />
          }
          ListEmptyComponent={
            <View className="items-center px-8 pt-24">
              <Text className="text-5xl">...</Text>
              <Text className="mt-4 text-base font-bold text-slate-600">
                Nenhuma conversa ainda
              </Text>
              <Text className="mt-2 text-center text-sm text-slate-400">
                Acesse um perfil e clique em Conversar
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
