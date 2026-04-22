import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../services/AuthContext';
import { listProfessionals } from '../services/api';

const CATEGORIES = [
  'Todos',
  'Desenvolvimento',
  'Design',
  'Marketing',
  'Fotografia',
  'Eletrica',
  'Encanamento',
];

const COLORS = ['#0f766e', '#0891b2', '#2563eb', '#ca8a04', '#ea580c', '#be123c'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function HomeScreen({ navigation }) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const { user, signOut } = useAuth();

  const load = useCallback(async (cat) => {
    try {
      const params = cat && cat !== 'Todos' ? { category: cat } : {};
      const res = await listProfessionals(params);
      setProfessionals(res.data);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar os profissionais.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(selectedCat);
  }, [load, selectedCat]);

  const onRefresh = () => {
    setRefreshing(true);
    load(selectedCat);
  };

  const filtered = professionals.filter((professional) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      professional.UserName?.toLowerCase().includes(q) ||
      professional.Category?.toLowerCase().includes(q) ||
      professional.Location?.toLowerCase().includes(q) ||
      professional.Tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const renderCard = ({ item }) => (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white"
      onPress={() => navigation.navigate('Profile', { professional: item })}
      activeOpacity={0.88}
    >
      <View className="flex-row items-start p-5">
        <View
          className="mr-4 h-[58px] w-[58px] items-center justify-center rounded-[20px]"
          style={{ backgroundColor: avatarColor(item.UserName) }}
        >
          <Text className="text-2xl font-black text-white">
            {item.UserName?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-900">{item.UserName}</Text>
              <Text className="mt-1 text-sm font-semibold text-teal-700">{item.Category}</Text>
            </View>
            <View className="rounded-full bg-amber-100 px-3 py-1">
              <Text className="text-xs font-black uppercase tracking-wide text-amber-700">
                {item.Rating?.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-sm leading-6 text-slate-500">
            {item.Location || 'Atendimento remoto e presencial sob consulta'}
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {item.Tags?.slice(0, 3).map((tag, index) => (
              <View key={index} className="rounded-full bg-slate-100 px-3 py-1.5">
                <Text className="text-xs font-semibold text-slate-700">{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
        <Text className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Valor medio
        </Text>
        <Text className="text-sm font-black text-slate-900">{item.PriceRange || 'Sob consulta'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#edf4f7]">
      <View className="overflow-hidden bg-slate-950 px-5 pb-7 pt-14">
        <View className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-teal-400/20" />
        <View className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-300/10" />

        <View className="w-full self-center" style={{ maxWidth: 1100 }}>
          <View className="flex-row items-start justify-between">
            <View className="max-w-[240px]">
              <Text className="text-xs font-black uppercase tracking-[0.35em] text-teal-300">
                Dashboard
              </Text>
              <Text className="mt-3 text-3xl font-black leading-9 text-white">
                Ola, {user?.Name?.split(' ')[0]}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-300">
                Explore profissionais disponiveis e encontre o perfil certo para sua demanda.
              </Text>
            </View>

            <TouchableOpacity
              onPress={signOut}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Text className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Sair
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 rounded-[24px] bg-white px-4 py-2.5">
            <TextInput
              className="text-base text-slate-900"
              placeholder="Busque por nome, categoria ou cidade"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="grow-0 pt-4"
        contentContainerClassName="px-4 gap-2 pb-2"
        contentContainerStyle={{ width: '100%', maxWidth: 1100, alignSelf: 'center' }}
        renderItem={({ item }) => {
          const selected = selectedCat === item;
          return (
            <TouchableOpacity
              className={`rounded-full px-4 py-2.5 ${
                selected ? 'bg-teal-700' : 'bg-white'
              }`}
              onPress={() => setSelectedCat(item)}
            >
              <Text
                className={`text-xs font-black uppercase tracking-wide ${
                  selected ? 'text-white' : 'text-slate-600'
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ActivityIndicator color="#0f766e" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderCard}
          contentContainerClassName="px-4 pb-6 pt-2"
          contentContainerStyle={{ width: '100%', maxWidth: 1100, alignSelf: 'center' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f766e']} />
          }
          ListEmptyComponent={
            <View className="items-center px-6 pt-20">
              <View className="rounded-full bg-white px-5 py-3">
                <Text className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Sem resultados
                </Text>
              </View>
              <Text className="mt-5 text-center text-lg font-black text-slate-700">
                Nenhum profissional encontrado.
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Ajuste os filtros ou tente uma busca diferente para ampliar os resultados.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
