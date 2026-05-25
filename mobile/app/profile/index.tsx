import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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
import { Colors } from '@/src/shared/constants/colors';
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
        onPress: async () => {
          await signOut();
          clearAuth();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              {profile?.AvatarUrl ? (
                <Image source={{ uri: profile.AvatarUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {user?.Name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              )}
            </View>
            <Text style={styles.name}>{user?.Name}</Text>
            <Text style={styles.email}>{user?.Email}</Text>
            {profile && (
              <View style={styles.ratingRow}>
                <StarRating rating={profile.Rating} size={16} />
                <Text style={styles.ratingText}>{profile.Rating.toFixed(1)} ({profile.ReviewCount} avaliações)</Text>
              </View>
            )}
          </View>

          {profile ? (
            <>
              {/* Profile info */}
              <Card style={styles.infoCard}>
                {profile.Title && (
                  <View style={styles.row}>
                    <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{profile.Title}</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Ionicons name="grid-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>{profile.Category}</Text>
                </View>
                {profile.Location && (
                  <View style={styles.row}>
                    <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{profile.Location}</Text>
                  </View>
                )}
                {profile.PriceRange && (
                  <View style={styles.row}>
                    <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{profile.PriceRange}</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Ionicons
                    name={profile.Available ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={profile.Available ? Colors.success : Colors.error}
                  />
                  <Text style={{ color: profile.Available ? Colors.success : Colors.error, fontSize: 14, fontWeight: '500' }}>
                    {profile.Available ? 'Disponível para trabalhos' : 'Indisponível'}
                  </Text>
                </View>
              </Card>

              {/* Tags */}
              {profile.Tags.length > 0 && (
                <View style={styles.tagsWrap}>
                  {profile.Tags.map((tag) => (
                    <View key={tag.Id} style={styles.tag}>
                      <Text style={styles.tagText}>{tag.Name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {profile.Bio && (
                <Card>
                  <Text style={styles.sectionLabel}>Bio</Text>
                  <Text style={styles.bioText}>{profile.Bio}</Text>
                </Card>
              )}

              <Button
                label="Editar perfil"
                variant="outline"
                onPress={() => router.push('/profile/edit')}
              />
            </>
          ) : (
            <Card style={styles.noProfileCard}>
              <Ionicons name="person-add-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.noProfileText}>Você ainda não tem perfil profissional</Text>
              <Button
                label="Criar perfil"
                onPress={() => router.push('/complete-profile')}
                style={{ width: '100%' }}
              />
            </Card>
          )}

          <Button
            label="Sair"
            variant="ghost"
            onPress={handleSignOut}
            style={styles.signOutBtn}
          />
        </View>
      </ScrollView>

      <BottomTabBar />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textOnPrimary },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 6 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, color: Colors.textSecondary },
  infoCard: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.textSecondary },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  bioText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  noProfileCard: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  noProfileText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  signOutBtn: { marginTop: 8 },
});
