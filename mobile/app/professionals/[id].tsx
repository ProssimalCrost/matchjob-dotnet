import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { Loading } from '@/src/shared/components/Loading';
import { StarRating } from '@/src/shared/components/StarRating';
import { getProfessionalById } from '@/src/features/professionals/services/professionalService';
import {
  getReviewsByProfessional,
  createReview,
} from '@/src/features/reviews/services/reviewService';
import {
  checkFavorite,
  addFavorite,
  removeFavorite,
} from '@/src/features/favorites/services/favoriteService';
import type { Professional } from '@/src/features/professionals/types/professionalTypes';
import type { Review } from '@/src/features/reviews/types/reviewTypes';
import { Colors } from '@/src/shared/constants/colors';

function ReviewCard({ review }: { review: Review }) {
  return (
    <View
      style={{ backgroundColor: Colors.slate100, borderColor: Colors.slate200 }}
      className="rounded-2xl border p-4"
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: Colors.primary100 }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Text style={{ color: Colors.primary700 }} className="text-sm font-bold">
            {review.ReviewerName.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.text }} className="text-sm font-semibold">
            {review.ReviewerName}
          </Text>
          <Text style={{ color: Colors.slate400 }} className="text-xs">
            {new Date(review.CreatedAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <StarRating value={review.Rating} size={16} />
      </View>
      {!!review.Comment && (
        <Text style={{ color: Colors.textSecondary }} className="mt-3 text-sm">
          {review.Comment}
        </Text>
      )}
    </View>
  );
}

export default function ProfessionalDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const id = params.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [prof, revs] = await Promise.all([
          getProfessionalById(id),
          getReviewsByProfessional(id),
        ]);
        setProfessional(prof);
        setReviews(revs);
        try {
          setIsFavorite(await checkFavorite(id));
        } catch {
          // not logged in
        }
      } catch {
        router.replace('/professionals');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  async function handleToggleFavorite() {
    if (togglingFav) return;
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch {
      Alert.alert('Erro', 'Faça login para favoritar.');
    } finally {
      setTogglingFav(false);
    }
  }

  async function handleSubmitReview() {
    if (rating === 0) return;
    try {
      setSubmittingReview(true);
      const newReview = await createReview(id, {
        rating,
        comment: comment.trim() || undefined,
      });
      setReviews((prev) => [newReview, ...prev]);
      if (professional) {
        const newCount = professional.ReviewCount + 1;
        const newRating =
          (professional.Rating * professional.ReviewCount + rating) / newCount;
        setProfessional({ ...professional, Rating: newRating, ReviewCount: newCount });
      }
      setRating(0);
      setComment('');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erro ao enviar avaliação.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
        <Sidebar />
        <Loading message="Carregando perfil..." />
      </View>
    );
  }

  if (!professional) return null;
  const p = professional;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}>
        {/* Header card */}
        <View
          style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
          className="rounded-3xl border p-6"
        >
          <View className="flex-row items-start gap-4">
            <View
              style={{ backgroundColor: Colors.primary }}
              className="h-20 w-20 items-center justify-center rounded-3xl"
            >
              <Text className="text-3xl font-bold text-white">
                {p.UserName.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View className="flex-row flex-wrap items-center gap-2">
                <Text style={{ color: Colors.text }} className="text-2xl font-bold">
                  {p.UserName}
                </Text>
                <View
                  style={{
                    backgroundColor: p.Available ? '#dcfce7' : Colors.slate100,
                  }}
                  className="rounded-full px-2.5 py-0.5"
                >
                  <Text
                    style={{ color: p.Available ? Colors.successText : Colors.slate500 }}
                    className="text-xs font-medium"
                  >
                    {p.Available ? 'Disponível' : 'Indisponível'}
                  </Text>
                </View>
              </View>
              {!!p.Title && (
                <Text style={{ color: Colors.primary700 }} className="mt-1 text-base font-medium">
                  {p.Title}
                </Text>
              )}
              <Text style={{ color: Colors.primary }} className="mt-2 text-sm font-medium">
                {p.Category}
              </Text>
              {!!p.Location && (
                <View className="mt-1 flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={14} color={Colors.slate400} />
                  <Text style={{ color: Colors.slate500 }} className="text-sm">
                    {p.Location}
                  </Text>
                </View>
              )}
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name="star" size={14} color={Colors.star} />
                <Text style={{ color: Colors.slate500 }} className="text-sm">
                  {p.Rating.toFixed(1)} ({p.ReviewCount}{' '}
                  {p.ReviewCount === 1 ? 'avaliação' : 'avaliações'})
                </Text>
              </View>
              {!!p.Price && (
                <View className="mt-2 flex-row items-center gap-1">
                  <Ionicons name="cash-outline" size={14} color={Colors.green} />
                  <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">
                    R$ {p.Price}/hora
                    {p.PriceRange ? `  (${p.PriceRange})` : ''}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={handleToggleFavorite}
              disabled={togglingFav}
              style={{
                borderColor: isFavorite ? '#fecaca' : Colors.slate200,
                backgroundColor: isFavorite ? '#fef2f2' : Colors.slate100,
              }}
              className="rounded-2xl border p-3"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? Colors.red : Colors.slate400}
              />
            </Pressable>
          </View>

          {!!p.Bio && (
            <Text
              style={{ color: Colors.textSecondary, borderTopColor: Colors.slate100 }}
              className="mt-6 border-t pt-6 text-sm leading-7"
            >
              {p.Bio}
            </Text>
          )}

          {p.Tags.length > 0 && (
            <View className="mt-5 flex-row flex-wrap gap-2">
              {p.Tags.map((tag) => (
                <View
                  key={tag.Id}
                  style={{ backgroundColor: Colors.primary50, borderColor: Colors.primary100 }}
                  className="flex-row items-center gap-1 rounded-full border px-3 py-1"
                >
                  <Ionicons name="pricetag" size={12} color={Colors.primary700} />
                  <Text style={{ color: Colors.primary700 }} className="text-xs font-medium">
                    {tag.Name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => router.push('/chat')}
            style={{ backgroundColor: Colors.slate950 }}
            className="mt-6 rounded-xl py-3"
          >
            <Text className="text-center text-sm font-semibold text-white">
              Chamar / Contratar
            </Text>
          </Pressable>
        </View>

        {/* Review form */}
        <View
          style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
          className="rounded-3xl border p-6"
        >
          <Text style={{ color: Colors.text }} className="mb-4 text-lg font-bold">
            Deixar avaliação
          </Text>
          <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-medium">
            Sua nota
          </Text>
          <StarRating value={rating} onChange={setRating} />
          <Text style={{ color: Colors.textSecondary }} className="mb-2 mt-4 text-sm font-medium">
            Comentário (opcional)
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Descreva sua experiência com este profissional."
            placeholderTextColor={Colors.slate400}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: Colors.slate100,
              borderColor: Colors.slate200,
              color: Colors.text,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            className="rounded-xl border px-4 py-3 text-sm"
          />
          <Pressable
            onPress={handleSubmitReview}
            disabled={submittingReview || rating === 0}
            style={{
              backgroundColor: Colors.primary,
              opacity: submittingReview || rating === 0 ? 0.6 : 1,
              alignSelf: 'flex-start',
            }}
            className="mt-4 rounded-xl px-6 py-2.5"
          >
            <Text className="text-sm font-semibold text-white">
              {submittingReview ? 'Enviando...' : 'Enviar avaliação'}
            </Text>
          </Pressable>
        </View>

        {/* Reviews list */}
        <View
          style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
          className="rounded-3xl border p-6"
        >
          <Text style={{ color: Colors.text }} className="mb-4 text-lg font-bold">
            Avaliações ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text style={{ color: Colors.slate400 }} className="py-6 text-center text-sm">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </Text>
          ) : (
            <View className="gap-3">
              {reviews.map((review) => (
                <ReviewCard key={review.Id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
