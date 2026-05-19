import { api } from "@/src/core/api/api";
import type {
  Professional,
  ProfessionalFilters,
  PagedProfessionalsResponse,
  CreateMyProfileRequest,
  UpdateProfessionalProfileRequest,
} from "../types/professionalTypes";

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

export async function getMyProfessionalProfile(): Promise<Professional> {
  const response = await api.get<Professional>("/professionals/me");
  return response.data;
}

export async function createMyProfessionalProfile(
  data: CreateMyProfileRequest,
): Promise<Professional> {
  const response = await api.post<Professional>("/professionals/me", data);
  return response.data;
}

export async function updateMyProfessionalProfile(
  data: UpdateProfessionalProfileRequest,
): Promise<Professional> {
  const response = await api.put<Professional>("/professionals/me", data);
  return response.data;
}
