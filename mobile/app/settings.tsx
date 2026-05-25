import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { Colors } from '@/src/shared/constants/colors';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { signOut } from '@/src/services/authService';

interface SettingItem {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  danger?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, clearAuth } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          clearAuth();
          router.replace('/login');
        },
      },
    ]);
  }

  const SETTINGS: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Conta',
      items: [
        { icon: 'person-outline', label: 'Meu perfil', onPress: () => router.push('/profile') },
        { icon: 'create-outline', label: 'Editar perfil', onPress: () => router.push('/profile/edit') },
      ],
    },
    {
      title: 'Aplicativo',
      items: [
        { icon: 'chatbubble-outline', label: 'Mensagens', onPress: () => router.push('/messages') },
        { icon: 'briefcase-outline', label: 'Pedidos', onPress: () => router.push('/requests') },
        { icon: 'search-outline', label: 'Profissionais', onPress: () => router.push('/professionals') },
      ],
    },
    {
      title: 'Sessão',
      items: [
        { icon: 'log-out-outline', label: 'Sair da conta', onPress: handleSignOut, danger: true },
      ],
    },
  ];

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* User info */}
        <Card style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{user?.Name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.Name}</Text>
            <Text style={styles.userEmail}>{user?.Email}</Text>
          </View>
        </Card>

        {SETTINGS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Card style={styles.groupCard}>
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.settingItem, index < group.items.length - 1 && styles.settingDivider]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingIcon, { backgroundColor: (item.danger ? Colors.error : Colors.primary) + '15' }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={item.danger ? Colors.error : Colors.primary}
                    />
                  </View>
                  <Text style={[styles.settingLabel, item.danger && styles.settingLabelDanger]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <Text style={styles.version}>MatchJob v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textOnPrimary },
  content: { padding: 20, gap: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  group: { gap: 6 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 4 },
  groupCard: { padding: 0, overflow: 'hidden' },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  settingDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  settingLabelDanger: { color: Colors.error },
  version: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});
