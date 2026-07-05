import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Role } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let signupClient: ReturnType<typeof createClient> | null = null;

function getSignupClient() {
  if (!signupClient) {
    signupClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'sb-service-express-signup',
      },
    });
  }
  return signupClient;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureProfile(_user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<Profile> {
  const existing = await getProfile(_user.id);
  if (existing) return existing;

  const { data, error } = await supabase.rpc('ensure_user_profile');

  if (error) {
    const msg = error.message ?? '';
    const code = (error as { code?: string }).code ?? '';
    if (
      code === 'PGRST202' ||
      msg.includes('Could not find the function') ||
      msg.includes('ensure_user_profile')
    ) {
      throw new Error(
        'Exécutez supabase/SETUP_COMPLET.sql dans Supabase → SQL Editor, puis reconnectez-vous.'
      );
    }
    throw error;
  }

  if (!data) {
    throw new Error('Impossible de créer le profil.');
  }

  return data as Profile;
}

async function createStaffProfile(userId: string, email: string, role: Role, zoneId?: string) {
  const { error } = await supabase.rpc('create_staff_profile', {
    p_user_id: userId,
    p_email: email,
    p_role: role,
    p_zone_id: zoneId ?? null,
  });

  if (error) {
    const existing = await getProfile(userId);
    if (existing) return;
    throw error;
  }
}

export async function createAuthUser(params: {
  email: string;
  password: string;
  role: Role;
  zone_id?: string;
  name?: string;
  phone?: string;
}) {
  const tempClient = getSignupClient();

  const { data, error } = await tempClient.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        role: params.role,
        zone_id: params.zone_id ?? null,
        name: params.name,
        phone: params.phone,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw new Error('Cet email est déjà utilisé par un autre compte');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('Impossible de créer le compte utilisateur');
  }

  await createStaffProfile(data.user.id, params.email, params.role, params.zone_id);

  return data.user;
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message);

    if (message.includes('schema cache') || message.includes("Could not find the")) {
      return 'Exécutez supabase/SETUP_COMPLET.sql dans Supabase → SQL Editor, puis reconnectez-vous.';
    }
    if (message.includes('duplicate') || message.includes('unique') || message.includes('déjà')) {
      return 'Cet élément existe déjà (email ou zone déjà utilisé)';
    }
    if (message.includes('403') || message.includes('permission') || message.includes('42501')) {
      return 'Permission refusée. Exécutez supabase/SETUP_COMPLET.sql dans Supabase.';
    }
    if (message.includes('Non autorisé')) {
      return 'Action non autorisée. Reconnectez-vous en tant que super admin.';
    }
    return message;
  }
  return 'Une erreur est survenue';
}
