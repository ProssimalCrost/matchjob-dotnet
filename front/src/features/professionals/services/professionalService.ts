import { api } from "@/src/core/api/api";
import type {
  Professional,
  ProfessionalFilters,
} from "../types/professionalTypes";

export async function getProfessionals(
  filters?: ProfessionalFilters,
): Promise<Professional[]> {
  const response = await api.get<Professional[]>("/professionals", {
    params: filters,
  });

  return response.data;
}

export async function getProfessionalById(id: string): Promise<Professional> {
  const response = await api.get<Professional>(`/professionals/${id}`);
  return response.data;
}

