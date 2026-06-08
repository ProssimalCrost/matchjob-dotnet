import { api } from "@/src/core/api/api";
import type { Professional } from "@/src/features/professionals/types/professionalTypes";

export async function getFavorites(): Promise<Professional[]> {
  const response = await api.get<Professional[]>("/favorites");
  return response.data;
}

export async function checkFavorite(professionalProfileId: string): Promise<boolean> {
  const response = await api.get<{ isFavorite: boolean }>(
    `/favorites/${professionalProfileId}/check`,
  );
  return response.data.isFavorite;
}

export async function addFavorite(professionalProfileId: string): Promise<void> {
  await api.post(`/favorites/${professionalProfileId}`);
}

export async function removeFavorite(professionalProfileId: string): Promise<void> {
  await api.delete(`/favorites/${professionalProfileId}`);
}
