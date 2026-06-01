import { api } from './api';
import type { Professional } from '@/src/types/professional';

export async function getFavorites(): Promise<Professional[]> {
  const { data } = await api.get<Professional[]>('/favorites');
  return data;
}

export async function checkFavorite(professionalProfileId: string): Promise<boolean> {
  const { data } = await api.get<{ isFavorite: boolean }>(`/favorites/${professionalProfileId}/check`);
  return data.isFavorite;
}

export async function addFavorite(professionalProfileId: string): Promise<void> {
  await api.post(`/favorites/${professionalProfileId}`);
}

export async function removeFavorite(professionalProfileId: string): Promise<void> {
  await api.delete(`/favorites/${professionalProfileId}`);
}
