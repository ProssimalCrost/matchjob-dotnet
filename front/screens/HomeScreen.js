import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
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
  PrimaryButton,
  ResponsiveShell,
  StatCard,
  Tag,
  palette,
  useResponsiveLayout,
} from '../components/MatchJobUI';
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

const COLORS = ['#4f46e5', '#2563eb', '#7c3aed', '#f97316', '#0ea5e9', '#14b8a6'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

function ProfessionalCard({ item, navigation, wide }) {
  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Profile', { professional: item })}
    >
      <Panel style={{ minHeight: wide ? 250 : undefined }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: avatarColor(item.UserName),
            }}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>
              {item.UserName?.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>
                  {item.UserName}
                </Text>
                <Text
                  style={{
                    color: palette.primaryStrong,
                    fontSize: 14,
                    fontWeight: '700',
                    marginTop: 4,
                  }}
                >
                  {item.Category}
                </Text>
              </View>
              <Tag tone="success">{`${item.Rating?.toFixed(1) || '0.0'} match`}</Tag>
            </View>

            <Text style={{ color: palette.textMuted, marginTop: 14, fontSize: 14, lineHeight: 22 }}>
              {item.Location || 'Disponivel para atendimento remoto e presencial.'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {item.Tags?.slice(0, 4).map((tag, index) => (
            <Tag key={`${tag}-${index}`}>{tag}</Tag>
          ))}
        </View>

        <View
          style={{
            marginTop: 20,
            borderTopWidth: 1,
            borderTopColor: '#eef1fb',
            paddingTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ color: palette.textMuted, fontSize: 12, fontWeight: '700' }}>
              Faixa estimada
            </Text>
            <Text style={{ color: palette.text, fontSize: 16, fontWeight: '800', marginTop: 4 }}>
              {item.PriceRange || 'Sob consulta'}
            </Text>
          </View>
          <PrimaryButton title="Ver perfil" onPress={() => navigation.navigate('Profile', { professional: item })} wide={false} />
        </View>
      </Panel>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const layout = useResponsiveLayout();
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

  const filtered = useMemo(() => {
    return professionals.filter((professional) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        professional.UserName?.toLowerCase().includes(q) ||
        professional.Category?.toLowerCase().includes(q) ||
        professional.Location?.toLowerCase().includes(q) ||
        professional.Tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [professionals, search]);

  const onRefresh = () => {
    setRefreshing(true);
    load(selectedCat);
  };

  return (
    <AppBackdrop>
      <FlatList
        data={filtered}
        key={`${layout.cardColumns}-${selectedCat}`}
        numColumns={layout.cardColumns}
        keyExtractor={(item) => item.Id.toString()}
        columnWrapperStyle={layout.cardColumns > 1 ? { gap: 18 } : undefined}
        renderItem={({ item }) => (
          <View
            style={{
              flex: layout.cardColumns > 1 ? 0.5 : 1,
              paddingBottom: 18,
            }}
          >
            <ProfessionalCard item={item} navigation={navigation} wide={layout.cardColumns > 1} />
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 130,
          alignSelf: 'center',
          width: '100%',
          maxWidth: layout.contentMaxWidth,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        ListHeaderComponent={
          <ResponsiveShell maxWidth={layout.contentMaxWidth}>
            <DesktopHeader
              eyebrow="Vagas / Descoberta"
              title={`Encontre a vaga ideal para ${user?.Name?.split(' ')[0] || 'voce'}`}
              subtitle="Uma home mais editorial, com busca em destaque, filtros visiveis e cards amplos inspirados no layout enviado."
              wide
              rightAction={<PrimaryButton title="Sair" onPress={signOut} wide={false} />}
            />

            <View
              style={{
                flexDirection: layout.isDesktop ? 'row' : 'column',
                gap: 18,
                marginTop: 20,
              }}
            >
              <View style={{ flex: layout.isDesktop ? 1.5 : undefined }}>
                <Panel>
                  <Text style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>
                    Buscar vagas, empresas ou habilidades
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
                    placeholder="Buscar vagas, empresas ou tecnologias"
                    placeholderTextColor="#98a0c9"
                    value={search}
                    onChangeText={setSearch}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingTop: 16 }}
                  >
                    {CATEGORIES.map((item) => {
                      const active = selectedCat === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setSelectedCat(item)}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 16,
                            paddingVertical: 11,
                            backgroundColor: active ? palette.primary : '#eef2ff',
                          }}
                        >
                          <Text
                            style={{
                              color: active ? '#fff' : palette.text,
                              fontSize: 12,
                              fontWeight: '800',
                            }}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </Panel>
              </View>

              <View style={{ flex: layout.isDesktop ? 1 : undefined, gap: 18 }}>
                <Panel style={{ paddingVertical: 18 }}>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <StatCard label="Perfis" value={String(professionals.length)} compact />
                    <StatCard label="Resultados" value={String(filtered.length)} compact />
                    <StatCard
                      label="Categoria"
                      value={selectedCat === 'Todos' ? 'Todas' : selectedCat.slice(0, 6)}
                      compact
                    />
                  </View>
                </Panel>
              </View>
            </View>
          </ResponsiveShell>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={palette.primary} size="large" style={{ marginTop: 60 }} />
          ) : (
            <ResponsiveShell maxWidth={layout.contentMaxWidth}>
              <EmptyState
                title="Nenhum resultado encontrado"
                subtitle="Ajuste a busca ou experimente outra categoria para ampliar as opcoes."
              />
            </ResponsiveShell>
          )
        }
        ListFooterComponent={<View style={{ height: 18 }} />}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponentStyle={{ paddingBottom: 18 }}
        style={{ flex: 1 }}
        ListFooterComponentStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponentStyle={{ paddingHorizontal: 20 }}
      />
    </AppBackdrop>
  );
}
