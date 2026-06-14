import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Backend API base URL — same value as front/ NEXT_PUBLIC_API_URL.
 * Note for devices:
 *  - Android emulator: use http://10.0.2.2:5000
 *  - iOS simulator:    http://localhost:5000 works
 *  - Physical device:  use your machine LAN IP (e.g. http://192.168.1.x:5000)
 */
export const API_URL =
  (extra.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://192.168.2.114:5000';

export const SUPABASE_URL =
  (extra.supabaseUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  '';

/**
 * Supabase publishable / anon key — same project as front/.
 * front/ calls it NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; mobile uses
 * EXPO_PUBLIC_SUPABASE_ANON_KEY (same value).
 */
export const SUPABASE_ANON_KEY =
  (extra.supabaseAnonKey as string | undefined) ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';
