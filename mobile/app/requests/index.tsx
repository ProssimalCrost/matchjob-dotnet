import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { Colors } from '@/src/shared/constants/colors';
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

const STATUS_COLOR: Record<ServiceRequestStatus, string> = {
  Pending: Colors.warning,
  Accepted: Colors.primary,
  InProgress: Colors.secondary,
  Completed: Colors.success,
  Canceled: Colors.textMuted,
  Rejected: Colors.error,
};

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getMyRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleUpdateStatus(id: string, status: ServiceRequestStatus) {
    try {
      const updated = await updateRequestStatus(id, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  }

  function getActions(req: ServiceRequest): { label: string; status: ServiceRequestStatus }[] {
    const isProfessional = user?.UserId === req.professionalId;
    if (req.status === 'Pending' && isProfessional) {
      return [{ label: 'Aceitar', status: 'Accepted' }, { label: 'Rejeitar', status: 'Rejected' }];
    }
    if (req.status === 'Accepted' && isProfessional) {
      return [{ label: 'Iniciar', status: 'InProgress' }];
    }
    if (req.status === 'InProgress' && isProfessional) {
      return [{ label: 'Concluir', status: 'Completed' }];
    }
    if ((req.status === 'Pending' || req.status === 'Accepted') && !isProfessional) {
      return [{ label: 'Cancelar', status: 'Canceled' }];
    }
    return [];
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Pedidos de serviço</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={52} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            </View>
          }
          renderItem={({ item }) => {
            const actions = getActions(item);
            const isClient = user?.UserId === item.clientId;
            return (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '20' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                      {STATUS_LABEL[item.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    {isClient ? `Para: ${item.professionalName}` : `De: ${item.clientName}`}
                  </Text>
                  {item.scheduledDate && (
                    <Text style={styles.metaText}>
                      {new Date(item.scheduledDate).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
                {actions.length > 0 && (
                  <View style={styles.actions}>
                    {actions.map((action) => (
                      <TouchableOpacity
                        key={action.status}
                        style={[
                          styles.actionBtn,
                          action.status === 'Rejected' || action.status === 'Canceled'
                            ? styles.actionBtnDanger
                            : styles.actionBtnPrimary,
                        ]}
                        onPress={() => handleUpdateStatus(item.id, action.status)}
                      >
                        <Text style={styles.actionBtnText}>{action.label}</Text>
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textOnPrimary },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12 },
  card: { gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnDanger: { backgroundColor: Colors.error },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textOnPrimary },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});
