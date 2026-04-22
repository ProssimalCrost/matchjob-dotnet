import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../services/AuthContext';
import { createConversation } from '../services/api';

const COLORS = ['#0f766e', '#0891b2', '#2563eb', '#ca8a04', '#ea580c', '#be123c'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ProfileScreen({ navigation, route }) {
  const { professional: p } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (user.Role === 'PROFESSIONAL') {
      Alert.alert('Aviso', 'Apenas clientes podem iniciar conversas.');
      return;
    }

    if (user.UserId === p.UserId) {
      Alert.alert('Aviso', 'Voce nao pode conversar com seu proprio perfil.');
      return;
    }

    setLoading(true);
    try {
      const res = await createConversation(user.UserId, p.UserId);
      const conv = res.data;
      navigation.navigate('Chat', {
        conversationId: conv.Id,
        otherName: p.UserName,
      });
    } catch {
      Alert.alert('Erro', 'Nao foi possivel iniciar a conversa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#edf4f7]" showsVerticalScrollIndicator={false}>
      <View
        className="overflow-hidden px-6 pb-10 pt-14"
        style={{ backgroundColor: avatarColor(p.UserName) }}
      >
        <View className="absolute -right-10 top-4 h-32 w-32 rounded-full bg-white/10" />
        <View className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-black/10" />

        <View className="w-full self-center" style={{ maxWidth: 1100 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-5 self-start">
            <Text className="text-xs font-black uppercase tracking-[0.3em] text-white/90">
              Voltar
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <View className="h-[92px] w-[92px] items-center justify-center rounded-[28px] border border-white/30 bg-white/15">
              <Text className="text-4xl font-black text-white">
                {p.UserName?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-3xl font-black text-white">{p.UserName}</Text>
              <Text className="mt-1 text-sm font-semibold text-white/85">{p.Category}</Text>
              <Text className="mt-3 text-sm leading-6 text-white/80">
                {p.Location || 'Disponivel para atendimento remoto e sob consulta'}
              </Text>
            </View>
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-[22px] bg-white/15 p-4">
              <Text className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70">
                Avaliacao
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">{p.Rating?.toFixed(1)}</Text>
            </View>
            <View className="flex-1 rounded-[22px] bg-white/15 p-4">
              <Text className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70">
                Valor
              </Text>
              <Text className="mt-2 text-lg font-black text-white">{p.PriceRange || '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full self-center px-4 py-5" style={{ maxWidth: 1100 }}>
        <View className="mb-4 rounded-[28px] bg-white p-5">
          <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-700">
            Sobre o profissional
          </Text>
          <Text className="mt-4 text-base leading-7 text-slate-700">
            {p.Description || 'Sem descricao cadastrada no momento.'}
          </Text>
        </View>

        {p.Tags?.length > 0 ? (
          <View className="mb-4 rounded-[28px] bg-white p-5">
            <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-700">
              Especialidades
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {p.Tags.map((tag, index) => (
                <View key={index} className="rounded-full bg-slate-100 px-3.5 py-2">
                  <Text className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          className={`mb-8 items-center rounded-[24px] bg-slate-950 py-4 ${
            loading ? 'opacity-70' : ''
          }`}
          onPress={handleChat}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-black uppercase tracking-[0.15em] text-white">
              Conversar agora
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
