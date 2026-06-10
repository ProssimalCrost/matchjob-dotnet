import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/src/services/supabase';
import { syncUser } from '@/src/services/authService';
import { getMyProfile } from '@/src/services/profileService';
import type { SyncUserResponse } from '@/src/types/user';
import type { Professional } from '@/src/types/professional';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: SyncUserResponse | null;
  profile: Professional | null;
  isLoading: boolean;
  hasProfile: boolean;
  refreshProfile: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SyncUserResponse | null>(null);
  const [profile, setProfile] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (s: Session) => {
    try {
      const syncedUser = await syncUser();
      setUser(syncedUser);

      try {
        const prof = await getMyProfile();
        setProfile(prof);
      } catch {
        // 404 means no profile yet — that's expected for new users
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const prof = await getMyProfile();
      setProfile(prof);
    } catch {
      setProfile(null);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        loadUserData(s).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setIsLoading(true);
        loadUserData(s).finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        hasProfile: profile !== null,
        refreshProfile,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
