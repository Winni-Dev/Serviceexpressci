import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile, ensureProfile } from '@/lib/auth';
import type { Profile } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string, user?: { email?: string; user_metadata?: Record<string, unknown> }) => {
    try {
      if (user) {
        const data = await ensureProfile({ id: userId, ...user });
        setProfile(data);
      } else {
        const data = await getProfile(userId);
        setProfile(data);
      }
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user?.id) {
        loadProfile(currentSession.user.id, currentSession.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        loadProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}
