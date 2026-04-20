// screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { createConversation } from '../services/api';
import { useAuth } from '../services/AuthContext';

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ProfileScreen({ navigation, route }) {
  // Dados do profissional vêm da HomeScreen (PascalCase do .NET)
  const { professional: p } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    // Só clientes podem iniciar conversa
    if (user.Role === 'PROFESSIONAL') {
      Alert.alert('Aviso', 'Apenas clientes podem iniciar conversas.');
      return;
    }
    // Não pode conversar consigo mesmo
    if (user.UserId === p.UserId) {
      Alert.alert('Aviso', 'Você não pode conversar com seu próprio perfil.');
      return;
    }

    setLoading(true);
    try {
      // clientId = UserId do usuário logado, professionalId = UserId do perfil
      const res = await createConversation(user.UserId, p.UserId);
      const conv = res.data; // { Id, ClientId, ClientName, ProfessionalId, ProfessionalName }
      navigation.navigate('Chat', {
        conversationId: conv.Id,
        otherName: p.UserName,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a conversa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header com avatar */}
      <View style={[styles.header, { backgroundColor: avatarColor(p.UserName) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{p.UserName?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{p.UserName}</Text>
        <Text style={styles.category}>{p.Category}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>⭐ {p.Rating?.toFixed(1)}</Text>
            <Text style={styles.statLbl}>Avaliação</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{p.PriceRange || '—'}</Text>
            <Text style={styles.statLbl}>Por hora</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>

        {/* Localização */}
        {p.Location ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Localização</Text>
            <Text style={styles.sectionText}>{p.Location}</Text>
          </View>
        ) : null}

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Sobre</Text>
          <Text style={styles.sectionText}>
            {p.Description || 'Sem descrição cadastrada.'}
          </Text>
        </View>

        {/* Habilidades */}
        {p.Tags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Habilidades</Text>
            <View style={styles.tagWrap}>
              {p.Tags.map((t, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Valor</Text>
          <Text style={styles.priceText}>{p.PriceRange || 'Sob consulta'}</Text>
        </View>

        {/* Botão Conversar */}
        <TouchableOpacity
          style={[styles.chatBtn, loading && styles.chatBtnDisabled]}
          onPress={handleChat}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.chatBtnText}>
                💬  Conversar com {p.UserName?.split(' ')[0]}
              </Text>
          }
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },

  header: {
    alignItems: 'center',
    paddingTop: 52, paddingBottom: 36, paddingHorizontal: 24,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backIcon: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },

  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 12,
  },
  avatarText: { fontSize: 38, fontWeight: '900', color: '#fff' },
  name: { fontSize: 24, fontWeight: '900', color: '#fff' },
  category: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },

  statsRow: { flexDirection: 'row', marginTop: 20, gap: 16, alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },

  body: { padding: 20 },

  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#4f46e5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionText: { fontSize: 15, color: '#333', lineHeight: 22 },
  priceText: { fontSize: 20, fontWeight: '800', color: '#059669' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#eef2ff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#c7d2fe',
  },
  tagText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },

  chatBtn: {
    backgroundColor: '#4f46e5', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    marginTop: 8, marginBottom: 36,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, elevation: 6,
  },
  chatBtnDisabled: { opacity: 0.65 },
  chatBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
