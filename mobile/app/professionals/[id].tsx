import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { Button } from '@/src/shared/components/Button';
import { StarRating } from '@/src/shared/components/StarRating';
import { Loading } from '@/src/shared/components/Loading';
import { Colors } from '@/src/shared/constants/colors';
import { getProfessionalById } from '@/src/services/professionalService';
import { getReviews, createReview } from '@/src/services/reviewService';
import { createOrGetConversation } from '@/src/services/messageService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Professional } from '@/src/types/professional';
import type { Review } from '@/src/types/review';

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProfessionalById(id), getReviews(id)])
      .then(([pro, revs]) => {
        setProfessional(pro);
        setReviews(revs);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMessage() {
    if (!user || !professional) return;
    setStartingChat(true);
    try {
      const conv = await createOrGetConversation({
        ClientId: user.UserId,
        ProfessionalId: professional.UserId,
      });
      router.push(`/messages/${conv.Id}` as any);
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar conversa.');
    } finally {
      setStartingChat(false);
    }
  }

  async function handleSubmitReview() {
    if (!id || reviewRating === 0) {
      Alert.alert('Atenção', 'Selecione uma nota antes de enviar.');
      return;
    }
    setSubmittingReview(true);
    try {
      const review = await createReview(id, { Rating: reviewRating, Comment: reviewComment || undefined });
      setReviews((prev) => [review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <Loading />;
  if (!professional) return null;

  const isOwnProfile = user?.UserId === professional.UserId;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              {professional.AvatarUrl ? (
                <Image source={{ uri: professional.AvatarUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>{professional.UserName?.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.name}>{professional.UserName}</Text>
            {professional.Title && <Text style={styles.title}>{professional.Title}</Text>}
            <View style={styles.ratingRow}>
              <StarRating rating={professional.Rating} size={16} />
              <Text style={styles.ratingText}>{professional.Rating.toFixed(1)} ({professional.ReviewCount})</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          {professional.Tags.length > 0 && (
            <View style={styles.tagsRow}>
              {professional.Tags.map((tag) => (
                <View key={tag.Id} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.Name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Info card */}
          <Card style={styles.infoCard}>
            {professional.Bio && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{professional.Bio}</Text>
              </View>
            )}
            {professional.Location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{professional.Location}</Text>
              </View>
            )}
            {professional.PriceRange && (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{professional.PriceRange}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{professional.Category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={professional.Available ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={16}
                color={professional.Available ? Colors.success : Colors.error}
              />
              <Text style={[styles.infoText, { color: professional.Available ? Colors.success : Colors.error }]}>
                {professional.Available ? 'Disponível' : 'Indisponível'}
              </Text>
            </View>
          </Card>

          {/* Description */}
          {professional.Description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre</Text>
              <Text style={styles.description}>{professional.Description}</Text>
            </View>
          )}

          {/* Action button */}
          {!isOwnProfile && (
            <Button
              label={startingChat ? 'Abrindo conversa...' : 'Enviar mensagem'}
              onPress={handleMessage}
              loading={startingChat}
              style={styles.msgBtn}
            />
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliações ({reviews.length})</Text>
            {reviews.length === 0 && (
              <Text style={styles.noReviews}>Nenhuma avaliação ainda.</Text>
            )}
            {reviews.map((review) => (
              <Card key={review.Id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.ReviewerName}</Text>
                  <StarRating rating={review.Rating} size={14} />
                </View>
                {review.Comment && <Text style={styles.reviewComment}>{review.Comment}</Text>}
                <Text style={styles.reviewDate}>
                  {new Date(review.CreatedAt).toLocaleDateString('pt-BR')}
                </Text>
              </Card>
            ))}
          </View>

          {/* Write review */}
          {!isOwnProfile && (
            <Card style={styles.reviewForm}>
              <Text style={styles.sectionTitle}>Deixar avaliação</Text>
              <View style={styles.starSelect}>
                <StarRating rating={reviewRating} size={28} readonly={false} onRate={setReviewRating} />
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Conte sua experiência (opcional)"
                placeholderTextColor={Colors.textMuted}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
              />
              <Button
                label="Enviar avaliação"
                onPress={handleSubmitReview}
                loading={submittingReview}
                variant="outline"
              />
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  headerBg: { backgroundColor: Colors.primary, paddingBottom: 24 },
  backBtn: { padding: 16 },
  profileSection: { alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: Colors.textOnPrimary },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textOnPrimary },
  title: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  infoCard: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { fontSize: 14, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  msgBtn: { marginTop: 4 },
  noReviews: { fontSize: 14, color: Colors.textMuted, fontStyle: 'italic' },
  reviewCard: { gap: 6, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  reviewDate: { fontSize: 11, color: Colors.textMuted },
  reviewForm: { gap: 12 },
  starSelect: { alignItems: 'center', paddingVertical: 4 },
  commentInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    height: 80,
    textAlignVertical: 'top',
  },
});
