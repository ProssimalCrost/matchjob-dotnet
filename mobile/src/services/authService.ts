import { supabase } from './supabase';
import { api } from './api';
import type { SyncUserResponse } from '@/src/types/user';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function syncUser(): Promise<SyncUserResponse> {
  const { data } = await api.post<SyncUserResponse>('/auth/sync-user');
  return data;
}

export async function getMe(): Promise<SyncUserResponse> {
  const { data } = await api.get<SyncUserResponse>('/auth/me');
  return data;
}
