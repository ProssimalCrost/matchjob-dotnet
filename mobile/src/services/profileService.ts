import { api } from './api';
import type { Professional, CreateMyProfileRequest, UpdateMyProfileRequest } from '@/src/types/professional';

export async function getMyProfile(): Promise<Professional> {
  const { data } = await api.get<Professional>('/professionals/me');
  return data;
}

export async function createMyProfile(payload: CreateMyProfileRequest): Promise<Professional> {
  const { data } = await api.post<Professional>('/professionals/me', payload);
  return data;
}

export async function updateMyProfile(payload: UpdateMyProfileRequest): Promise<Professional> {
  const { data } = await api.put<Professional>('/professionals/me', payload);
  return data;
}
