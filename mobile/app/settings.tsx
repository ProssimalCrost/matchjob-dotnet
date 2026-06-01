import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { signOut } from '@/src/services/authService';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
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
        { icon: 'heart-outline', label: 'Favoritos', onPress: () => router.push('/favorites') },
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
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View
        className="flex-row justify-between items-center bg-slate-950 border-b border-slate-800 px-3 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Configurações</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 32 }}
      >
        {/* User card */}
        <Card className="flex-row items-center gap-3.5">
          <View className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 items-center justify-center">
            <Text className="text-lg font-bold text-primary">
              {user?.Name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold">{user?.Name}</Text>
            <Text className="text-slate-400 text-sm mt-0.5">{user?.Email}</Text>
          </View>
        </Card>

        {SETTINGS.map((group) => (
          <View key={group.title} className="gap-1.5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
              {group.title}
            </Text>
            <Card className="p-0 overflow-hidden">
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center gap-3 p-3.5 ${index < group.items.length - 1 ? 'border-b border-slate-800' : ''}`}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center ${item.danger ? 'bg-red-500/15' : 'bg-primary/15'}`}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.danger ? '#ef4444' : '#7c3aed'}
                    />
                  </View>
                  <Text
                    className={`flex-1 text-[15px] font-medium ${item.danger ? 'text-red-400' : 'text-slate-200'}`}
                  >
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <Text className="text-xs text-slate-600 text-center mt-2">MatchJob v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
