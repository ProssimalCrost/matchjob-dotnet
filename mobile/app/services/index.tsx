import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import {
  getServiceRequests,
  updateServiceStatus,
  deleteServiceRequest,
} from '@/src/features/services/services/serviceService';
import type {
  ServiceRequest,
  ServiceStatus,
} from '@/src/features/services/types/serviceTypes';
import { getToken, decodeUserIdFromToken } from '@/src/shared/utils/token';
import { Colors } from '@/src/shared/constants/colors';

const STATUS_LABEL: Record<ServiceStatus, string> = {
  Pending: 'Aguardando',
  Accepted: 'Aceito',
  InProgress: 'Em andamento',
  Completed: 'Concluído',
  Canceled: 'Cancelado',
  Rejected: 'Recusado',
};

const STATUS_COLOR: Record<ServiceStatus, { bg: string; fg: string }> = {
  Pending: { bg: '#fefce8', fg: '#a16207' },
  Accepted: { bg: '#eff6ff', fg: '#1d4ed8' },
  InProgress: { bg: '#f5f3ff', fg: '#6d28d9' },
  Completed: { bg: '#f0fdf4', fg: '#15803d' },
  Canceled: { bg: '#f8fafc', fg: '#64748b' },
  Rejected: { bg: '#fef2f2', fg: '#b91c1c' },
};

type Tab = 'hired' | 'providing' | 'received' | 'sent';

const TABS: { id: Tab; label: string }[] = [
  { id: 'hired', label: 'Contratei' },
  { id: 'providing', label: 'Estou prestando' },
  { id: 'received', label: 'Recebidas' },
  { id: 'sent', label: 'Enviadas' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('hired');
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((t) => setCurrentUserId(decodeUserIdFromToken(t)));
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceRequests();
      setServices(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) return;
      console.error(err);
      if (status === 404) {
        setError(
          'O endpoint /service-requests ainda não existe no backend. Implemente-o para ativar esta página.',
        );
      } else {
        setError(
          'Não foi possível carregar os serviços. Verifique se o backend está rodando.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleStatusChange(id: string, status: ServiceStatus) {
    try {
      await updateServiceStatus(id, status);
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch {
      Alert.alert('Erro', 'Erro ao atualizar status.');
    }
  }

  function confirmCancel(id: string) {
    Alert.alert('Cancelar', 'Cancelar esta solicitação?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteServiceRequest(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
          } catch {
            Alert.alert('Erro', 'Erro ao cancelar solicitação.');
          }
        },
      },
    ]);
  }

  const filtered = services.filter((s) => {
    if (activeTab === 'hired') return s.clientId === currentUserId;
    if (activeTab === 'providing')
      return (
        s.professionalId === currentUserId &&
        ['Accepted', 'InProgress', 'Completed'].includes(s.status)
      );
    if (activeTab === 'received')
      return s.professionalId === currentUserId && s.status === 'Pending';
    if (activeTab === 'sent')
      return s.clientId === currentUserId && s.status === 'Pending';
    return false;
  });

  const emptyMsg: Record<Tab, string> = {
    hired: 'Você ainda não contratou nenhum serviço.',
    providing: 'Você não tem serviços em andamento.',
    received: 'Nenhuma solicitação recebida no momento.',
    sent: 'Você não enviou nenhuma solicitação.',
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: Colors.text }} className="text-3xl font-bold">
          Serviços
        </Text>
        <Text style={{ color: Colors.textMuted }} className="mb-6 mt-2 text-sm">
          Gerencie os serviços que você contratou ou está prestando.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: active ? Colors.primary : Colors.surface,
                    borderColor: active ? Colors.primary : Colors.slate200,
                  }}
                  className="rounded-xl border px-4 py-2.5"
                >
                  <Text
                    style={{ color: active ? Colors.white : Colors.textSecondary }}
                    className="text-sm font-semibold"
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {loading ? (
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{ backgroundColor: Colors.slate200, height: 140 }}
                className="rounded-3xl"
              />
            ))}
          </View>
        ) : error ? (
          <View
            style={{ backgroundColor: Colors.surface, borderColor: Colors.slate300 }}
            className="items-center rounded-3xl border border-dashed p-10"
          >
            <Ionicons name="close-circle" size={48} color={Colors.slate300} />
            <Text style={{ color: Colors.text }} className="mt-4 text-lg font-bold">
              Não foi possível carregar
            </Text>
            <Text style={{ color: Colors.textMuted }} className="mt-2 text-center text-sm">
              {error}
            </Text>
            <Pressable
              onPress={loadServices}
              style={{ backgroundColor: Colors.primary }}
              className="mt-6 flex-row items-center gap-2 rounded-xl px-5 py-2.5"
            >
              <Ionicons name="refresh" size={16} color={Colors.white} />
              <Text className="text-sm font-semibold text-white">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View
            style={{ backgroundColor: Colors.surface, borderColor: Colors.slate300 }}
            className="items-center rounded-3xl border border-dashed p-10"
          >
            <Ionicons name="time-outline" size={48} color={Colors.slate300} />
            <Text style={{ color: Colors.text }} className="mt-4 text-lg font-bold">
              Nada por aqui ainda
            </Text>
            <Text style={{ color: Colors.textMuted }} className="mt-2 text-center text-sm">
              {emptyMsg[activeTab]}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {filtered.map((service) => {
              const isClient = activeTab === 'hired' || activeTab === 'sent';
              const sc = STATUS_COLOR[service.status];
              return (
                <View
                  key={service.id}
                  style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
                  className="rounded-3xl border p-6"
                >
                  <View className="flex-row flex-wrap items-center gap-3">
                    <Text style={{ color: Colors.text }} className="text-lg font-bold">
                      {service.title}
                    </Text>
                    <View style={{ backgroundColor: sc.bg }} className="rounded-full px-3 py-0.5">
                      <Text style={{ color: sc.fg }} className="text-xs font-semibold">
                        {STATUS_LABEL[service.status]}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: Colors.primary700 }} className="mt-1 text-sm font-medium">
                    {isClient
                      ? `Profissional: ${service.professionalName || 'Não informado'}`
                      : `Cliente: ${service.clientName || 'Não informado'}`}
                  </Text>

                  <Text style={{ color: Colors.textSecondary }} className="mt-3 text-sm">
                    {service.description}
                  </Text>

                  <View className="mt-4 flex-row flex-wrap gap-4">
                    {!!service.priceAgreed && (
                      <Text style={{ color: Colors.textSecondary }} className="text-xs font-medium">
                        💰 {service.priceAgreed}
                      </Text>
                    )}
                    {!!service.scheduledDate && (
                      <Text style={{ color: Colors.textMuted }} className="text-xs">
                        📅 {new Date(service.scheduledDate).toLocaleDateString('pt-BR')}
                      </Text>
                    )}
                    {!!service.location && (
                      <Text style={{ color: Colors.textMuted }} className="text-xs">
                        📍 {service.location}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{ borderTopColor: Colors.slate100 }}
                    className="mt-5 flex-row flex-wrap gap-3 border-t pt-4"
                  >
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/chat?participantId=${service.professionalId || service.clientId}`,
                        )
                      }
                      style={{ borderColor: Colors.slate200 }}
                      className="flex-row items-center gap-2 rounded-xl border px-4 py-2"
                    >
                      <Ionicons name="chatbubbles-outline" size={16} color={Colors.textSecondary} />
                      <Text style={{ color: Colors.textSecondary }} className="text-sm font-medium">
                        Abrir chat
                      </Text>
                    </Pressable>

                    {activeTab === 'received' && (
                      <>
                        <Pressable
                          onPress={() => handleStatusChange(service.id, 'Accepted')}
                          style={{ backgroundColor: Colors.green }}
                          className="flex-row items-center gap-2 rounded-xl px-4 py-2"
                        >
                          <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                          <Text className="text-sm font-semibold text-white">Aceitar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleStatusChange(service.id, 'Rejected')}
                          style={{ borderColor: '#fecaca' }}
                          className="flex-row items-center gap-2 rounded-xl border px-4 py-2"
                        >
                          <Ionicons name="close-circle" size={16} color={Colors.red} />
                          <Text style={{ color: Colors.red }} className="text-sm font-medium">
                            Recusar
                          </Text>
                        </Pressable>
                      </>
                    )}

                    {activeTab === 'providing' && service.status === 'Accepted' && (
                      <Pressable
                        onPress={() => handleStatusChange(service.id, 'InProgress')}
                        style={{ backgroundColor: Colors.primary }}
                        className="flex-row items-center gap-2 rounded-xl px-4 py-2"
                      >
                        <Ionicons name="refresh" size={16} color={Colors.white} />
                        <Text className="text-sm font-semibold text-white">Iniciar serviço</Text>
                      </Pressable>
                    )}

                    {activeTab === 'providing' && service.status === 'InProgress' && (
                      <Pressable
                        onPress={() => handleStatusChange(service.id, 'Completed')}
                        style={{ backgroundColor: Colors.green }}
                        className="flex-row items-center gap-2 rounded-xl px-4 py-2"
                      >
                        <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                        <Text className="text-sm font-semibold text-white">Concluir</Text>
                      </Pressable>
                    )}

                    {(activeTab === 'hired' || activeTab === 'sent') &&
                      ['Pending', 'Accepted'].includes(service.status) && (
                        <Pressable
                          onPress={() => confirmCancel(service.id)}
                          style={{ borderColor: '#fecaca' }}
                          className="flex-row items-center gap-2 rounded-xl border px-4 py-2"
                        >
                          <Ionicons name="close-circle" size={16} color={Colors.red} />
                          <Text style={{ color: Colors.red }} className="text-sm font-medium">
                            Cancelar
                          </Text>
                        </Pressable>
                      )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
