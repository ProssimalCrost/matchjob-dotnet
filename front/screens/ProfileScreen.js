import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import {
  AppBackdrop,
  BrandMark,
  Panel,
  PrimaryButton,
  ResponsiveShell,
  StatCard,
  Tag,
  palette,
  useResponsiveLayout,
} from '../components/MatchJobUI';
import { useAuth } from '../services/AuthContext';
import { createConversation } from '../services/api';

const COLORS = ['#4f46e5', '#2563eb', '#7c3aed', '#f97316', '#0ea5e9', '#14b8a6'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

export default function ProfileScreen({ navigation, route }) {
  const layout = useResponsiveLayout();
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
    <AppBackdrop>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ResponsiveShell maxWidth={layout.contentMaxWidth}>
          <View
            style={{
              borderRadius: 34,
              backgroundColor: avatarColor(p.UserName),
              padding: 24,
              overflow: 'hidden',
              marginTop: 28,
            }}
          >
            <View
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.1)',
                right: -30,
                top: -40,
              }}
            />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 22 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Voltar</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: layout.isDesktop ? 'row' : 'column',
                gap: 20,
                alignItems: layout.isDesktop ? 'center' : 'flex-start',
              }}
            >
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.35)',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 42, fontWeight: '900' }}>
                  {p.UserName?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>{p.UserName}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.84)', fontSize: 16, marginTop: 6 }}>
                  {p.Category}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.74)', fontSize: 14, marginTop: 10, lineHeight: 22 }}>
                  {p.Location || 'Disponivel para remoto e presencial.'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  <Tag tone="dark">{p.PriceRange || 'Sob consulta'}</Tag>
                  <Tag tone="dark">{`${p.Rating?.toFixed(1) || '0.0'} match`}</Tag>
                </View>
              </View>

              {layout.isDesktop ? (
                <PrimaryButton title="Conversar agora" onPress={handleChat} loading={loading} wide={false} />
              ) : null}
            </View>
          </View>

          <View
            style={{
              flexDirection: layout.isDesktop ? 'row' : 'column',
              gap: 18,
              marginTop: 20,
              paddingBottom: 120,
            }}
          >
            <View style={{ flex: layout.isDesktop ? 1.25 : undefined, gap: 18 }}>
              <Panel>
                <Text style={{ color: palette.text, fontSize: 13, fontWeight: '800' }}>Sobre o profissional</Text>
                <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 26, marginTop: 12 }}>
                  {p.Description || 'Perfil ainda sem descricao detalhada.'}
                </Text>
              </Panel>

              <Panel>
                <Text style={{ color: palette.text, fontSize: 13, fontWeight: '800' }}>Principais habilidades</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                  {p.Tags?.length ? (
                    p.Tags.map((tag, index) => <Tag key={`${tag}-${index}`}>{tag}</Tag>)
                  ) : (
                    <Text style={{ color: palette.textMuted }}>Nenhuma habilidade cadastrada.</Text>
                  )}
                </View>
              </Panel>
            </View>

            <View style={{ flex: 1, gap: 18 }}>
              <Panel>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <StatCard label="Avaliacao" value={p.Rating?.toFixed(1) || '0.0'} compact />
                  <StatCard label="Perfil" value="95%" compact />
                </View>
              </Panel>

              <Panel>
                <View style={{ alignItems: 'center' }}>
                  <BrandMark size={52} />
                  <Text style={{ color: palette.text, fontSize: 18, fontWeight: '900', marginTop: 14 }}>
                    Perfil pronto para contato
                  </Text>
                  <Text
                    style={{
                      color: palette.textMuted,
                      marginTop: 8,
                      textAlign: 'center',
                      fontSize: 14,
                      lineHeight: 23,
                    }}
                  >
                    Use o chat para iniciar a conversa e continuar a jornada com a mesma linguagem visual das referencias.
                  </Text>
                </View>
              </Panel>

              {!layout.isDesktop ? (
                <PrimaryButton title="Conversar agora" onPress={handleChat} loading={loading} />
              ) : null}
            </View>
          </View>
        </ResponsiveShell>
      </ScrollView>
    </AppBackdrop>
  );
}
