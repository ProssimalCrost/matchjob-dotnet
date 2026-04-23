import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AppBackdrop,
  DesktopHeader,
  EmptyState,
  Panel,
  ResponsiveShell,
  StatCard,
  Tag,
  palette,
  useResponsiveLayout,
} from '../components/MatchJobUI';
import { useAuth } from '../services/AuthContext';
import { getConversations } from '../services/api';

const COLORS = ['#4f46e5', '#2563eb', '#7c3aed', '#f97316', '#0ea5e9', '#14b8a6'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ConversationsScreen({ navigation }) {
  const layout = useResponsiveLayout();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
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

  const otherName = useCallback(
    (conversation) =>
      user.UserId === conversation.ClientId
        ? conversation.ProfessionalName
        : conversation.ClientName,
    [user.UserId]
  );

  const filtered = useMemo(() => {
    return conversations.filter((conversation) =>
      otherName(conversation).toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, otherName, search]);

  return (
    <AppBackdrop>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.Id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 130,
          alignSelf: 'center',
          width: '100%',
          maxWidth: layout.contentMaxWidth,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            load();
          }} colors={[palette.primary]} />
        }
        renderItem={({ item }) => {
          const name = otherName(item);
          const isClient = user.UserId === item.ClientId;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.Id,
                  otherName: name,
                })
              }
              style={{ marginBottom: 16 }}
            >
              <Panel>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: avatarColor(name),
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '900', flex: 1 }}>
                        {name}
                      </Text>
                      <Tag>{isClient ? 'Contato iniciado' : 'Nova conversa'}</Tag>
                    </View>
                    <Text style={{ color: palette.textMuted, marginTop: 8, fontSize: 14, lineHeight: 22 }}>
                      {isClient
                        ? 'Voce iniciou esta conversa. Continue o contato pelo chat.'
                        : 'Uma empresa ou candidato entrou em contato com voce.'}
                    </Text>
                  </View>
                </View>
              </Panel>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
          <View>
            <DesktopHeader
              eyebrow="Mensagens"
              title="Sua caixa de entrada"
              subtitle="Conversa com leitura mais clara, blocos amplos e densidade mais equilibrada para celular e desktop."
            />

            <View
              style={{
                marginTop: 20,
                flexDirection: layout.isDesktop ? 'row' : 'column',
                gap: 18,
              }}
            >
              <View style={{ flex: layout.isDesktop ? 1.3 : undefined }}>
                <Panel>
                  <Text style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>
                    Buscar conversa
                  </Text>
                  <TextInput
                    style={{
                      marginTop: 14,
                      borderWidth: 1,
                      borderColor: '#e2e8ff',
                      borderRadius: 18,
                      backgroundColor: '#fbfbff',
                      paddingHorizontal: 16,
                      paddingVertical: 15,
                      color: palette.text,
                      fontSize: 15,
                    }}
                    placeholder="Digite o nome do contato"
                    placeholderTextColor="#98a0c9"
                    value={search}
                    onChangeText={setSearch}
                  />
                </Panel>
              </View>

              <View style={{ flex: 1 }}>
                <Panel style={{ paddingVertical: 18 }}>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <StatCard label="Ativas" value={String(conversations.length)} compact />
                    <StatCard label="Filtradas" value={String(filtered.length)} compact />
                  </View>
                </Panel>
              </View>
            </View>
          </View>
        }
        ListHeaderComponentStyle={{ paddingVertical: 28 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={palette.primary} size="large" style={{ marginTop: 60 }} />
          ) : (
            <EmptyState
              title="Nenhuma conversa ainda"
              subtitle="Visite um perfil e use o botao de contato para iniciar uma nova conversa."
            />
          )
        }
      />
    </AppBackdrop>
  );
}
