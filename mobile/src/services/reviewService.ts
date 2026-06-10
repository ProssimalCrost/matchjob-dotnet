import { api } from './api';
import type { Review, CreateReviewRequest } from '@/src/types/review';

export async function getReviews(professionalId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/professionals/${professionalId}/reviews`);
  return data;
}

export async function createReview(
  professionalId: string,
  payload: CreateReviewRequest,
): Promise<Review> {
  const { data } = await api.post<Review>(`/professionals/${professionalId}/reviews`, payload);
  return data;
}
