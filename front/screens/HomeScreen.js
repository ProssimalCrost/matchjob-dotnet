// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { listProfessionals } from '../services/api';
import { useAuth } from '../services/AuthContext';

const CATEGORIES = ['Todos', 'Desenvolvimento', 'Design', 'Marketing', 'Fotografia', 'Elétrica', 'Encanamento'];

export default function HomeScreen({ navigation }) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedCat, setSelectedCat]     = useState('Todos');
  const [search, setSearch]               = useState('');
  const { user, signOut } = useAuth();

  // Carrega profissionais — aplica filtro de categoria
  const load = useCallback(async (cat) => {
    try {
      const params = cat && cat !== 'Todos' ? { category: cat } : {};
      const res = await listProfessionals(params);
      // .NET retorna PascalCase: Id, UserId, UserName, Category, Tags, Location, etc.
      setProfessionals(res.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os profissionais.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(selectedCat); }, [selectedCat]);

  const onRefresh = () => { setRefreshing(true); load(selectedCat); };

  // Filtro de busca local (por nome, categoria, tag, cidade)
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
      style={styles.card}
      onPress={() => navigation.navigate('Profile', { professional: item })}
      activeOpacity={0.85}
    >
      {/* Avatar com inicial */}
      <View style={[styles.avatar, { backgroundColor: avatarColor(item.UserName) }]}>
        <Text style={styles.avatarText}>{item.UserName?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.UserName}</Text>
        <Text style={styles.cardCat}>{item.Category}</Text>
        {item.Location ? <Text style={styles.cardLoc}>📍 {item.Location}</Text> : null}

        {/* Tags */}
        <View style={styles.tagRow}>
          {item.Tags?.slice(0, 3).map((t, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rating + preço */}
      <View style={styles.cardRight}>
        <Text style={styles.rating}>⭐ {item.Rating?.toFixed(1)}</Text>
        <Text style={styles.price} numberOfLines={1}>{item.PriceRange}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.Name?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerSub}>Encontre o profissional ideal</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <TextInput
        style={styles.search}
        placeholder="🔍  Buscar por nome, tag ou cidade..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filtro de categorias */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catBtn, selectedCat === item && styles.catBtnActive]}
            onPress={() => setSelectedCat(item)}
          >
            <Text style={[styles.catText, selectedCat === item && styles.catTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Lista */}
      {loading
        ? <ActivityIndicator color="#4f46e5" size="large" style={styles.loader} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={(p) => p.Id.toString()}
            renderItem={renderCard}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhum profissional encontrado.</Text>
            }
          />
        )
      }
    </View>
  );
}

// Gera uma cor de avatar a partir do nome
const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
  },
  greeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#c7d2fe', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  search: {
    margin: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
  },

  catList: { flexGrow: 0, marginBottom: 10 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  catBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  catText: { fontSize: 13, color: '#666', fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  loader: { marginTop: 60 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 3,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cardCat: { fontSize: 12, color: '#4f46e5', fontWeight: '600', marginTop: 2 },
  cardLoc: { fontSize: 11, color: '#999', marginTop: 3 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tag: { backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#4f46e5', fontWeight: '500' },
  cardRight: { alignItems: 'flex-end', gap: 4, maxWidth: 80 },
  rating: { fontSize: 13, fontWeight: '700', color: '#f59e0b' },
  price: { fontSize: 10, color: '#4f46e5', fontWeight: '600', textAlign: 'right' },
});
