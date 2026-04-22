import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../services/AuthContext';
import { createConversation } from '../services/api';

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
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
    <ScrollView className="flex-1 bg-indigo-50" showsVerticalScrollIndicator={false}>
      <View
        className="items-center px-6 pb-9 pt-14"
        style={{ backgroundColor: avatarColor(p.UserName) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4 self-start">
          <Text className="text-sm font-semibold text-white/85">Voltar</Text>
        </TouchableOpacity>

        <View className="mb-3 h-24 w-24 items-center justify-center rounded-full border-4 border-white/50 bg-white/25">
          <Text className="text-4xl font-black text-white">
            {p.UserName?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text className="text-2xl font-black text-white">{p.UserName}</Text>
        <Text className="mt-1 text-sm font-medium text-white/80">{p.Category}</Text>

        <View className="mt-5 flex-row items-center gap-4">
          <View className="items-center">
            <Text className="text-sm font-bold text-white">Nota {p.Rating?.toFixed(1)}</Text>
            <Text className="mt-0.5 text-[11px] text-white/70">Avaliacao</Text>
          </View>
          <View className="h-8 w-px bg-white/30" />
          <View className="items-center">
            <Text className="text-sm font-bold text-white">{p.PriceRange || '-'}</Text>
            <Text className="mt-0.5 text-[11px] text-white/70">Por hora</Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        {p.Location ? (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
              Localizacao
            </Text>
            <Text className="text-base leading-6 text-slate-700">{p.Location}</Text>
          </View>
        ) : null}

        <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            Sobre
          </Text>
          <Text className="text-base leading-6 text-slate-700">
            {p.Description || 'Sem descricao cadastrada.'}
          </Text>
        </View>

        {p.Tags?.length > 0 ? (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
              Habilidades
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {p.Tags.map((tag, index) => (
                <View
                  key={index}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5"
                >
                  <Text className="text-sm font-semibold text-indigo-600">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            Valor
          </Text>
          <Text className="text-2xl font-black text-emerald-600">
            {p.PriceRange || 'Sob consulta'}
          </Text>
        </View>

        <TouchableOpacity
          className={`mb-9 mt-2 items-center rounded-2xl bg-indigo-600 py-4 ${
            loading ? 'opacity-70' : ''
          }`}
          onPress={handleChat}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-extrabold text-white">
              Conversar com {p.UserName?.split(' ')[0]}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
