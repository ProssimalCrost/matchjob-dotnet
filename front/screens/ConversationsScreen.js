// screens/ConversationsScreen.js
// Lista todas as conversas do usuário logado
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { getConversations } from '../services/api';
import { useAuth } from '../services/AuthContext';

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ConversationsScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const { user } = useAuth();

  const load = useCallback(async () => {
    try {
      const res = await getConversations(user.UserId);
      // .NET retorna: { Id, ClientId, ClientName, ProfessionalId, ProfessionalName }
      setConversations(res.data);
    } catch {
      // silencia
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.UserId]);

  useEffect(() => { load(); }, []);

  // Determina o nome do "outro" usuário na conversa
  const otherName = (conv) =>
    user.UserId === conv.ClientId ? conv.ProfessionalName : conv.ClientName;

  const renderItem = ({ item }) => {
    const name = otherName(item);
    const isClient = user.UserId === item.ClientId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.Id,
          otherName: name,
        })}
        activeOpacity={0.85}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor(name) }]}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>
            {isClient ? '👤 Você é o cliente' : '💼 Você é o profissional'}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <Text style={styles.headerSub}>{conversations.length} ativa(s)</Text>
      </View>

      {loading
        ? <ActivityIndicator color="#4f46e5" size="large" style={styles.loader} />
        : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.Id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); load(); }}
                colors={['#4f46e5']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
                <Text style={styles.emptySub}>Acesse um perfil e clique em "Conversar"</Text>
              </View>
            }
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },

  header: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: '#c7d2fe', marginTop: 2 },

  loader: { marginTop: 60 },
  list: { padding: 16 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 3,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  role: { fontSize: 12, color: '#888', marginTop: 3 },
  arrow: { fontSize: 22, color: '#c7d2fe', fontWeight: '300' },

  emptyWrap: { alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#555' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
});
