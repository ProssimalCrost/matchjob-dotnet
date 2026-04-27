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
  DashboardFrame,
  EmptyState,
  Panel,
  PrimaryButton,
  ResponsiveShell,
  SearchPanel,
  SidebarCard,
  Tag,
  SurfaceHeader,
  palette,
  useResponsiveLayout,
} from '../components/MatchJobUI';
import { useAuth } from '../services/AuthContext';
import { getApiErrorMessage, listProfessionals } from '../services/api';

const CATEGORIES = [
  { key: 'Todos', label: 'Todos', bg: '#f3f4f6', text: '#374151' },
  { key: 'Desenvolvimento', label: 'Dev', bg: '#ede9fe', text: '#6d28d9' },
  { key: 'Design', label: 'Design', bg: '#fce7f3', text: '#be185d' },
  { key: 'Marketing', label: 'Marketing', bg: '#dbeafe', text: '#1d4ed8' },
  { key: 'Fotografia', label: 'Foto', bg: '#ffedd5', text: '#c2410c' },
  { key: 'Eletrica', label: 'Eletrica', bg: '#e0f2fe', text: '#0369a1' },
  { key: 'Encanamento', label: 'Encanamento', bg: '#ccfbf1', text: '#0f766e' },
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
      <Panel style={{ minHeight: wide ? 356 : undefined, padding: 22, alignItems: 'center' }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: avatarColor(item.UserName),
            marginBottom: 14,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900' }}>
            {item.UserName?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={{ color: palette.text, fontSize: 19, fontWeight: '900', textAlign: 'center' }}>
          {item.UserName}
        </Text>
        <Text style={{ color: palette.textMuted, fontSize: 13, fontWeight: '700', marginTop: 5, textAlign: 'center' }}>
          {item.Category}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          <Tag tone="success">{`${item.Rating?.toFixed(1) || '0.0'} match`}</Tag>
          <Tag>{item.PriceRange || 'Sob consulta'}</Tag>
        </View>

        <Text style={{ color: palette.textMuted, marginTop: 14, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>
          {item.Location || 'Remoto e presencial'}
        </Text>

        <Text
          numberOfLines={3}
          style={{ color: palette.textMuted, marginTop: 14, fontSize: 14, lineHeight: 22, textAlign: 'center' }}
        >
          {item.Description || 'Profissional com perfil completo pronto para novas oportunidades.'}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {item.Tags?.slice(0, 3).map((tag, index) => (
            <Tag key={`${tag}-${index}`}>{tag}</Tag>
          ))}
        </View>

        <View style={{ alignSelf: 'stretch', marginTop: 18 }}>
          <PrimaryButton title="Ver perfil" onPress={() => navigation.navigate('Profile', { professional: item })} />
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
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Nao foi possivel carregar os profissionais.'));
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
    <DashboardFrame active="home" navigation={navigation} signOut={signOut}>
      <FlatList
        data={filtered}
        key={`${layout.cardColumns}-${selectedCat}`}
        numColumns={layout.cardColumns}
        keyExtractor={(item) => item.Id.toString()}
        columnWrapperStyle={layout.cardColumns > 1 ? { gap: 18 } : undefined}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              paddingBottom: 18,
            }}
          >
            <ProfessionalCard item={item} navigation={navigation} wide={layout.cardColumns > 1} />
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: layout.isDesktop ? 40 : 130,
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
            <SurfaceHeader
              title={`Bem-vindo ao MatchJob${user?.Name ? `, ${user.Name.split(' ')[0]}` : ''}`}
              subtitle="Encontre profissionais disponiveis, compare habilidades e inicie uma conversa."
              action={!layout.isDesktop ? <PrimaryButton title="Sair" onPress={signOut} wide={false} /> : null}
            />

            <View
              style={{
                flexDirection: layout.isDesktop ? 'row' : 'column',
                gap: 18,
                marginTop: 20,
                alignItems: 'stretch',
              }}
            >
              <View style={{ flex: layout.isDesktop ? 1.5 : undefined, gap: 18 }}>
                <SearchPanel
                  title="Buscar profissionais"
                  subtitle="Filtre por nome, area, localizacao ou habilidades."
                >
                  <View style={{ flexDirection: layout.isDesktop ? 'row' : 'column', gap: 12 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        backgroundColor: '#f9fafb',
                        paddingHorizontal: 16,
                        paddingVertical: 15,
                        color: palette.text,
                        fontSize: 15,
                      }}
                      placeholder="Servico, profissional ou habilidade"
                      placeholderTextColor="#98a0c9"
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingTop: 16 }}
                  >
                    {CATEGORIES.map((item) => {
                      const active = selectedCat === item.key;
                      return (
                        <TouchableOpacity
                          key={item.key}
                          onPress={() => setSelectedCat(item.key)}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 16,
                            paddingVertical: 11,
                            backgroundColor: active ? palette.primary : item.bg,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? '#fff' : item.text,
                              fontSize: 12,
                              fontWeight: '800',
                            }}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </SearchPanel>

                <Panel>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 18,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>
                        Profissionais disponiveis
                      </Text>
                      <Text style={{ color: palette.textMuted, marginTop: 6, fontSize: 14 }}>
                        {filtered.length} resultados encontrados para a sua busca.
                      </Text>
                    </View>
                    <Tag>{filtered.length} perfis</Tag>
                  </View>
                </Panel>
              </View>

              <View style={{ flex: layout.isDesktop ? 0.9 : undefined, gap: 18 }}>
                <SidebarCard title="Resumo da busca">
                  <View style={{ gap: 12 }}>
                    <View
                      style={{
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        padding: 16,
                      }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700' }}>
                        Perfis carregados
                      </Text>
                      <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '900', marginTop: 6 }}>
                        {professionals.length}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        padding: 16,
                      }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700' }}>
                        Filtro ativo
                      </Text>
                      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800', marginTop: 6 }}>
                        {selectedCat === 'Todos' ? 'Todas as areas' : selectedCat}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        padding: 16,
                      }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700' }}>
                        Busca digitada
                      </Text>
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800', marginTop: 6 }}>
                        {search.trim() || 'Sem termo'}
                      </Text>
                    </View>
                  </View>
                </SidebarCard>
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
    </DashboardFrame>
  );
}
