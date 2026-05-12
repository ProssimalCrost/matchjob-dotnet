import { api } from "@/src/core/api/api";
import type {
  Professional,
  ProfessionalFilters,
} from "../types/professionalTypes";

export type PagedProfessionalsResponse = {
  data: Professional[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getProfessionals(
  filters?: ProfessionalFilters,
): Promise<PagedProfessionalsResponse> {
  const response = await api.get<PagedProfessionalsResponse>("/professionals", {
    params: filters,
  });

  return response.data;
}

export async function getProfessionalById(id: string): Promise<Professional> {
  const response = await api.get<Professional>(`/professionals/${id}`);
  return response.data;
}