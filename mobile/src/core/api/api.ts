import axios from 'axios';
import { router } from 'expo-router';
import { supabase } from '@/src/core/supabase/client';
import { API_URL } from '@/src/shared/constants/config';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Injects the Supabase access_token into every request (same as front/).
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Redirect to /login on 401 (front does window.location.replace('/login')).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        router.replace('/login');
      } catch {
        // navigation may not be ready; callers can still handle the error
      }
    }
    return Promise.reject(error);
  },
);
