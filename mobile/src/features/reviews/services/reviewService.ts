import { api } from "@/src/core/api/api";
import type { Review } from "../types/reviewTypes";

export async function getReviewsByProfessional(professionalId: string): Promise<Review[]> {
  const response = await api.get<Review[]>(`/professionals/${professionalId}/reviews`);
  return response.data;
}

export async function createReview(
  professionalId: string,
  data: { rating: number; comment?: string },
): Promise<Review> {
  const response = await api.post<Review>(
    `/professionals/${professionalId}/reviews`,
    data,
  );
  return response.data;
}
