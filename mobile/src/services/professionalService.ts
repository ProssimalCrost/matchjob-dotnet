import { api } from './api';
import type { Professional, PagedProfessionals, ProfessionalFilters } from '@/src/types/professional';

export async function getProfessionals(
  filters?: ProfessionalFilters,
): Promise<PagedProfessionals> {
  const { data } = await api.get<PagedProfessionals>('/professionals', { params: filters });
  return data;
}

export async function getProfessionalById(id: string): Promise<Professional> {
  const { data } = await api.get<Professional>(`/professionals/${id}`);
  return data;
}
