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

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
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

  const filtered = professionals.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.UserName?.toLowerCase().includes(q) ||
      p.Category?.toLowerCase().includes(q) ||
      p.Location?.toLowerCase().includes(q) ||
      p.Tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const renderCard = ({ item }) => (
    <TouchableOpacity
      className="mb-3 flex-row rounded-2xl bg-white p-4 shadow-sm"
      onPress={() => navigation.navigate('Profile', { professional: item })}
      activeOpacity={0.85}
    >
      <View
        className="mr-3 h-[52px] w-[52px] items-center justify-center rounded-full"
        style={{ backgroundColor: avatarColor(item.UserName) }}
      >
        <Text className="text-xl font-extrabold text-white">
          {item.UserName?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">{item.UserName}</Text>
        <Text className="mt-0.5 text-xs font-semibold text-indigo-600">{item.Category}</Text>
        {item.Location ? (
          <Text className="mt-1 text-xs text-slate-400">Local: {item.Location}</Text>
        ) : null}

        <View className="mt-2 flex-row flex-wrap gap-1">
          {item.Tags?.slice(0, 3).map((tag, index) => (
            <View key={index} className="rounded-md bg-indigo-50 px-2 py-1">
              <Text className="text-[11px] font-medium text-indigo-600">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="max-w-20 items-end">
        <Text className="text-xs font-bold text-amber-500">Nota {item.Rating?.toFixed(1)}</Text>
        <Text className="mt-1 text-right text-[10px] font-semibold text-indigo-600">
          {item.PriceRange}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-indigo-50">
      <View className="flex-row items-center justify-between bg-indigo-600 px-5 pb-5 pt-14">
        <View>
          <Text className="text-lg font-extrabold text-white">
            Ola, {user?.Name?.split(' ')[0]}
          </Text>
          <Text className="mt-0.5 text-xs text-indigo-200">
            Encontre o profissional ideal
          </Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          className="rounded-lg bg-white/20 px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-white">Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="mx-4 mb-2 mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 shadow-sm"
        placeholder="Buscar por nome, tag ou cidade..."
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="mb-2 grow-0"
        contentContainerClassName="px-4 gap-2"
        renderItem={({ item }) => {
          const selected = selectedCat === item;
          return (
            <TouchableOpacity
              className={`rounded-full border px-4 py-2 ${
                selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 bg-white'
              }`}
              onPress={() => setSelectedCat(item)}
            >
              <Text
                className={`text-xs font-semibold ${
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
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderCard}
          contentContainerClassName="px-4 pb-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4f46e5']}
            />
          }
          ListEmptyComponent={
            <Text className="mt-16 text-center text-sm text-slate-400">
              Nenhum profissional encontrado.
            </Text>
          }
        />
      )}
    </View>
  );
}
