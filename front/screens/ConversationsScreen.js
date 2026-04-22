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

const COLORS = ['#0f766e', '#0891b2', '#2563eb', '#ca8a04', '#ea580c', '#be123c'];
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

  const otherName = (conversation) =>
    user.UserId === conversation.ClientId
      ? conversation.ProfessionalName
      : conversation.ClientName;

  const renderItem = ({ item }) => {
    const name = otherName(item);
    const isClient = user.UserId === item.ClientId;

    return (
      <TouchableOpacity
        className="mb-4 rounded-[28px] bg-white p-5"
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.Id,
            otherName: name,
          })
        }
        activeOpacity={0.88}
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[18px]"
            style={{ backgroundColor: avatarColor(name) }}
          >
            <Text className="text-xl font-black text-white">{name.charAt(0).toUpperCase()}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-lg font-black text-slate-900">{name}</Text>
            <Text className="mt-1 text-sm text-slate-500">
              {isClient ? 'Voce iniciou esta conversa' : 'Conversa recebida como profissional'}
            </Text>
          </View>

          <View className="rounded-full bg-slate-100 px-3 py-1.5">
            <Text className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Abrir
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#edf4f7]">
      <View className="bg-slate-950 px-5 pb-7 pt-14">
        <View className="w-full self-center" style={{ maxWidth: 1100 }}>
          <Text className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
            Caixa de entrada
          </Text>
          <Text className="mt-3 text-3xl font-black text-white">Suas conversas</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">
            Acompanhe respostas, retome contatos e abra o chat rapidamente.
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#0f766e" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderItem}
          contentContainerClassName="px-4 pb-6 pt-5"
          contentContainerStyle={{ width: '100%', maxWidth: 1100, alignSelf: 'center' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              load();
            }} colors={['#0f766e']} />
          }
          ListHeaderComponent={
            <View className="mb-4 flex-row items-center justify-between rounded-[24px] bg-teal-700 px-5 py-4">
              <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-100">
                Ativas
              </Text>
              <Text className="text-2xl font-black text-white">{conversations.length}</Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center rounded-[28px] bg-white px-8 py-12">
              <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Sem mensagens
              </Text>
              <Text className="mt-4 text-center text-lg font-black text-slate-700">
                Nenhuma conversa ainda
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Visite um perfil profissional e use o botao de conversa para iniciar um contato.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
