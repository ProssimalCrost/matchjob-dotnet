import axios from 'axios';
import { supabase } from './supabase';
import { API_URL } from '@/src/shared/constants/config';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Callers handle 401/404 themselves; just re-throw
    return Promise.reject(error);
  },
);
