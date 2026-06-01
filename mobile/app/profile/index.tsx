import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { Button } from '@/src/shared/components/Button';
import { StarRating } from '@/src/shared/components/StarRating';
import { BottomTabBar } from '@/src/shared/components/BottomTabBar';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { signOut } from '@/src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, clearAuth } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => { await signOut(); clearAuth(); router.replace('/login'); },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="flex-row justify-between items-center bg-slate-950 border-b border-slate-800 px-5 pb-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Text className="text-white text-xl font-bold">Meu Perfil</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} className="w-9 h-9 rounded-xl bg-slate-800 items-center justify-center">
            <Ionicons name="settings-outline" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5 gap-4">
          {/* Avatar + name */}
          <View className="items-center gap-1.5">
            <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 items-center justify-center overflow-hidden">
              {profile?.AvatarUrl
                ? <Image source={{ uri: profile.AvatarUrl }} className="w-full h-full" />
                : <Text className="text-3xl font-bold text-primary">{user?.Name?.charAt(0).toUpperCase() ?? '?'}</Text>
              }
            </View>
            <Text className="text-white text-xl font-bold">{user?.Name}</Text>
            <Text className="text-slate-400 text-sm">{user?.Email}</Text>
            {profile && (
              <View className="flex-row items-center gap-1.5">
                <StarRating rating={profile.Rating} size={16} />
                <Text className="text-slate-400 text-sm">{profile.Rating.toFixed(1)} ({profile.ReviewCount} avaliações)</Text>
              </View>
            )}
          </View>

          {profile ? (
            <>
              <Card className="gap-2.5">
                {profile.Title && (
                  <View className="flex-row items-center gap-2.5">
                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                    <Text className="text-slate-300 text-sm">{profile.Title}</Text>
                  </View>
                )}
                <View className="flex-row items-center gap-2.5">
                  <Ionicons name="grid-outline" size={16} color="#64748b" />
                  <Text className="text-slate-300 text-sm">{profile.Category}</Text>
                </View>
                {profile.Location && (
                  <View className="flex-row items-center gap-2.5">
                    <Ionicons name="location-outline" size={16} color="#64748b" />
                    <Text className="text-slate-300 text-sm">{profile.Location}</Text>
                  </View>
                )}
                {profile.PriceRange && (
                  <View className="flex-row items-center gap-2.5">
                    <Ionicons name="cash-outline" size={16} color="#64748b" />
                    <Text className="text-slate-300 text-sm">{profile.PriceRange}</Text>
                  </View>
                )}
                <View className="flex-row items-center gap-2.5">
                  <Ionicons
                    name={profile.Available ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={profile.Available ? '#22c55e' : '#ef4444'}
                  />
                  <Text className={`text-sm font-medium ${profile.Available ? 'text-green-400' : 'text-red-400'}`}>
                    {profile.Available ? 'Disponível para trabalhos' : 'Indisponível'}
                  </Text>
                </View>
              </Card>

              {profile.Tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {profile.Tags.map((tag) => (
                    <View key={tag.Id} className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30">
                      <Text className="text-xs text-primary font-medium">{tag.Name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {profile.Bio && (
                <Card>
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Bio</Text>
                  <Text className="text-slate-300 text-sm leading-[22px]">{profile.Bio}</Text>
                </Card>
              )}

              <Button label="Editar perfil" variant="outline" onPress={() => router.push('/profile/edit')} />
            </>
          ) : (
            <Card className="items-center gap-3 py-6">
              <Ionicons name="person-add-outline" size={40} color="#334155" />
              <Text className="text-slate-400 text-sm text-center">Você ainda não tem perfil profissional</Text>
              <Button label="Criar perfil" onPress={() => router.push('/complete-profile')} className="w-full" />
            </Card>
          )}

          <Button label="Sair da conta" variant="ghost" onPress={handleSignOut} className="mt-2" />
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}
