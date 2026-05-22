import { api } from "@/src/core/api/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/authTypes";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
}

export async function getMe(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>("/auth/me");
  return response.data;
}

/**
 * Sincroniza o usuário Supabase com a tabela local.
 * Deve ser chamado após qualquer login/cadastro bem-sucedido no Supabase,
 * antes de qualquer operação que exija o usuário na tabela local.
 */
export async function syncUser(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/sync-user");
  return response.data;
}
