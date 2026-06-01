import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/shared/components/Card';
import { Button } from '@/src/shared/components/Button';
import { StarRating } from '@/src/shared/components/StarRating';
import { Loading } from '@/src/shared/components/Loading';
import { getProfessionalById } from '@/src/services/professionalService';
import { getReviews, createReview } from '@/src/services/reviewService';
import { createOrGetConversation } from '@/src/services/messageService';
import { checkFavorite, addFavorite, removeFavorite } from '@/src/services/favoriteService';
import { createRequest } from '@/src/services/requestService';
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProfessionalById(id),
      getReviews(id),
      user ? checkFavorite(id).catch(() => false) : Promise.resolve(false),
    ])
      .then(([pro, revs, fav]) => { setProfessional(pro); setReviews(revs); setIsFavorited(fav); })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  async function handleMessage() {
    if (!user || !professional) return;
    setStartingChat(true);
    try {
      const conv = await createOrGetConversation({ ClientId: user.UserId, ProfessionalId: professional.UserId });
      router.push(`/messages/${conv.Id}` as any);
    } catch { Alert.alert('Erro', 'Não foi possível iniciar conversa.'); }
    finally { setStartingChat(false); }
  }

  async function handleToggleFavorite() {
    if (!id) return;
    setTogglingFavorite(true);
    try {
      if (isFavorited) { await removeFavorite(id); setIsFavorited(false); }
      else { await addFavorite(id); setIsFavorited(true); }
    } catch { Alert.alert('Erro', 'Não foi possível atualizar favorito.'); }
    finally { setTogglingFavorite(false); }
  }

  async function handleSubmitReview() {
    if (!id || reviewRating === 0) { Alert.alert('Atenção', 'Selecione uma nota antes de enviar.'); return; }
    setSubmittingReview(true);
    try {
      const review = await createReview(id, { Rating: reviewRating, Comment: reviewComment || undefined });
      setReviews((prev) => [review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
    } catch { Alert.alert('Erro', 'Não foi possível enviar a avaliação.'); }
    finally { setSubmittingReview(false); }
  }

  async function handleSubmitRequest() {
    if (!professional || !user) return;
    if (!reqTitle.trim()) { Alert.alert('Atenção', 'O título é obrigatório.'); return; }
    if (!reqDescription.trim()) { Alert.alert('Atenção', 'A descrição é obrigatória.'); return; }
    setSubmittingRequest(true);
    try {
      await createRequest({
        professionalId: professional.UserId,
        title: reqTitle.trim(),
        description: reqDescription.trim(),
        location: reqLocation.trim() || undefined,
        categoryId: professional.CategoryId || undefined,
      });
      setShowRequestModal(false);
      setReqTitle(''); setReqDescription(''); setReqLocation('');
      Alert.alert('Enviado!', 'Pedido de serviço enviado com sucesso.');
    } catch { Alert.alert('Erro', 'Não foi possível enviar o pedido.'); }
    finally { setSubmittingRequest(false); }
  }

  if (loading) return <Loading />;
  if (!professional) return null;

  const isOwnProfile = user?.UserId === professional.UserId;

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <View className="bg-primary/10 border-b border-primary/20 pb-6" style={{ paddingTop: insets.top + 8 }}>
          <View className="flex-row justify-between items-center px-2">
            <TouchableOpacity onPress={() => router.back()} className="p-2.5">
              <Ionicons name="arrow-back" size={24} color="#f8fafc" />
            </TouchableOpacity>
            {!isOwnProfile && user && (
              <TouchableOpacity onPress={handleToggleFavorite} className="p-2.5" disabled={togglingFavorite}>
                {togglingFavorite
                  ? <ActivityIndicator size="small" color="#f8fafc" />
                  : <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={24} color={isFavorited ? '#ef4444' : '#f8fafc'} />
                }
              </TouchableOpacity>
            )}
          </View>

          <View className="items-center gap-2 px-5">
            <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 items-center justify-center overflow-hidden">
              {professional.AvatarUrl
                ? <Image source={{ uri: professional.AvatarUrl }} className="w-full h-full" />
                : <Text className="text-4xl font-bold text-primary">{professional.UserName?.charAt(0).toUpperCase()}</Text>
              }
            </View>
            <Text className="text-2xl font-bold text-white">{professional.UserName}</Text>
            {professional.Title && <Text className="text-slate-400 text-sm">{professional.Title}</Text>}
            <View className="flex-row items-center gap-2">
              <StarRating rating={professional.Rating} size={16} />
              <Text className="text-slate-300 text-sm font-medium">{professional.Rating.toFixed(1)} ({professional.ReviewCount})</Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-4 gap-4">
          {/* Tags */}
          {professional.Tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {professional.Tags.map((tag) => (
                <View key={tag.Id} className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30">
                  <Text className="text-xs text-primary font-medium">{tag.Name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Info card */}
          <Card className="gap-2.5">
            {professional.Bio && (
              <View className="flex-row items-start gap-2.5">
                <Ionicons name="person-outline" size={16} color="#64748b" />
                <Text className="text-slate-300 text-sm flex-1 leading-5">{professional.Bio}</Text>
              </View>
            )}
            {professional.Location && (
              <View className="flex-row items-center gap-2.5">
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text className="text-slate-300 text-sm">{professional.Location}</Text>
              </View>
            )}
            {professional.PriceRange && (
              <View className="flex-row items-center gap-2.5">
                <Ionicons name="cash-outline" size={16} color="#64748b" />
                <Text className="text-slate-300 text-sm">{professional.PriceRange}</Text>
              </View>
            )}
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="briefcase-outline" size={16} color="#64748b" />
              <Text className="text-slate-300 text-sm">{professional.Category}</Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <Ionicons
                name={professional.Available ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={professional.Available ? '#22c55e' : '#ef4444'}
              />
              <Text className={`text-sm font-medium ${professional.Available ? 'text-green-400' : 'text-red-400'}`}>
                {professional.Available ? 'Disponível' : 'Indisponível'}
              </Text>
            </View>
          </Card>

          {/* Description */}
          {professional.Description && (
            <View className="gap-2">
              <Text className="text-white text-base font-bold">Sobre</Text>
              <Text className="text-slate-400 text-sm leading-[22px]">{professional.Description}</Text>
            </View>
          )}

          {/* Action buttons */}
          {!isOwnProfile && (
            <View className="flex-row gap-2.5">
              <Button label={startingChat ? 'Abrindo...' : 'Mensagem'} onPress={handleMessage} loading={startingChat} variant="outline" className="flex-1" />
              <Button label="Solicitar serviço" onPress={() => setShowRequestModal(true)} className="flex-1" />
            </View>
          )}

          {/* Reviews */}
          <View className="gap-3">
            <Text className="text-white text-base font-bold">Avaliações ({reviews.length})</Text>
            {reviews.length === 0 && <Text className="text-slate-500 text-sm italic">Nenhuma avaliação ainda.</Text>}
            {reviews.map((review) => (
              <Card key={review.Id} className="gap-1.5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-200 text-sm font-semibold">{review.ReviewerName}</Text>
                  <StarRating rating={review.Rating} size={14} />
                </View>
                {review.Comment && <Text className="text-slate-400 text-[13px] leading-5">{review.Comment}</Text>}
                <Text className="text-slate-600 text-[11px]">{new Date(review.CreatedAt).toLocaleDateString('pt-BR')}</Text>
              </Card>
            ))}
          </View>

          {/* Write review */}
          {!isOwnProfile && (
            <Card className="gap-3">
              <Text className="text-white text-base font-bold">Deixar avaliação</Text>
              <View className="items-center py-1">
                <StarRating rating={reviewRating} size={28} readonly={false} onRate={setReviewRating} />
              </View>
              <TextInput
                className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white h-20"
                placeholder="Conte sua experiência (opcional)"
                placeholderTextColor="#64748b"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Button label="Enviar avaliação" onPress={handleSubmitReview} loading={submittingReview} variant="outline" />
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Service Request Modal */}
      <Modal visible={showRequestModal} animationType="slide" transparent onRequestClose={() => setShowRequestModal(false)}>
        <KeyboardAvoidingView className="flex-1 justify-end bg-black/70" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-slate-900 rounded-t-3xl px-6 pt-3 border-t border-slate-800" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="w-10 h-1 rounded bg-slate-700 self-center mb-4" />
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-white text-lg font-bold">Solicitar serviço</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)} className="p-1">
                <Ionicons name="close" size={24} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-400 text-sm mb-4">Para: {professional?.UserName}</Text>

            <Text className="text-slate-300 text-sm font-medium mb-1.5">Título *</Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white mb-3"
              placeholder="Ex: Desenvolvimento de site"
              placeholderTextColor="#64748b"
              value={reqTitle}
              onChangeText={setReqTitle}
              maxLength={100}
            />
            <Text className="text-slate-300 text-sm font-medium mb-1.5">Descrição *</Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white h-24 mb-3"
              placeholder="Descreva o que você precisa..."
              placeholderTextColor="#64748b"
              value={reqDescription}
              onChangeText={setReqDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text className="text-slate-300 text-sm font-medium mb-1.5">Localização (opcional)</Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white mb-4"
              placeholder="Ex: São Paulo, SP"
              placeholderTextColor="#64748b"
              value={reqLocation}
              onChangeText={setReqLocation}
            />
            <Button label="Enviar pedido" onPress={handleSubmitRequest} loading={submittingRequest} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
