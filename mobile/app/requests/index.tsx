import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { getMyRequests, updateRequestStatus } from '@/src/services/requestService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { ServiceRequest, ServiceRequestStatus } from '@/src/types/request';

const STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  Pending: 'Pendente',
  Accepted: 'Aceito',
  InProgress: 'Em andamento',
  Completed: 'Concluído',
  Canceled: 'Cancelado',
  Rejected: 'Rejeitado',
};

const STATUS_CLASS: Record<ServiceRequestStatus, { bg: string; text: string }> = {
  Pending: { bg: 'bg-amber-400/15', text: 'text-amber-400' },
  Accepted: { bg: 'bg-primary/15', text: 'text-primary' },
  InProgress: { bg: 'bg-teal-400/15', text: 'text-teal-400' },
  Completed: { bg: 'bg-green-400/15', text: 'text-green-400' },
  Canceled: { bg: 'bg-slate-700/30', text: 'text-slate-400' },
  Rejected: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getMyRequests().then(setRequests).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleUpdateStatus(id: string, status: ServiceRequestStatus) {
    try {
      const updated = await updateRequestStatus(id, { status });
      setRequests((prev) => prev.map((r) => r.id === id ? updated : r));
    } catch { Alert.alert('Erro', 'Não foi possível atualizar o status.'); }
  }

  function getActions(req: ServiceRequest): { label: string; status: ServiceRequestStatus; danger?: boolean }[] {
    const isProfessional = user?.UserId === req.professionalId;
    if (req.status === 'Pending' && isProfessional)
      return [{ label: 'Aceitar', status: 'Accepted' }, { label: 'Rejeitar', status: 'Rejected', danger: true }];
    if (req.status === 'Accepted' && isProfessional)
      return [{ label: 'Iniciar', status: 'InProgress' }];
    if (req.status === 'InProgress' && isProfessional)
      return [{ label: 'Concluir', status: 'Completed' }];
    if ((req.status === 'Pending' || req.status === 'Accepted') && !isProfessional)
      return [{ label: 'Cancelar', status: 'Canceled', danger: true }];
    return [];
  }

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-950 border-b border-slate-800 px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white text-xl font-bold">Pedidos de serviço</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="mt-10" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-12 gap-3">
              <Ionicons name="briefcase-outline" size={52} color="#334155" />
              <Text className="text-slate-400 text-base">Nenhum pedido encontrado</Text>
            </View>
          }
          renderItem={({ item }) => {
            const actions = getActions(item);
            const isClient = user?.UserId === item.clientId;
            const sc = STATUS_CLASS[item.status];
            return (
              <Card className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-200 text-[15px] font-semibold flex-1 mr-2" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View className={`rounded-full px-2.5 py-1 ${sc.bg}`}>
                    <Text className={`text-[11px] font-bold ${sc.text}`}>{STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-[13px] leading-[18px]" numberOfLines={2}>{item.description}</Text>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-xs">
                    {isClient ? `Para: ${item.professionalName}` : `De: ${item.clientName}`}
                  </Text>
                  {item.scheduledDate && (
                    <Text className="text-slate-500 text-xs">
                      {new Date(item.scheduledDate).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
                {actions.length > 0 && (
                  <View className="flex-row gap-2 mt-1">
                    {actions.map((action) => (
                      <TouchableOpacity
                        key={action.status}
                        className={`flex-1 rounded-lg py-2 items-center ${action.danger ? 'bg-red-600' : 'bg-primary'}`}
                        onPress={() => handleUpdateStatus(item.id, action.status)}
                      >
                        <Text className="text-white text-[13px] font-semibold">{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}

      <BottomTabBar />
    </View>
  );
}
