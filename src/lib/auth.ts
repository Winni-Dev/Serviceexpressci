import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { sanitizeTextInput } from '@/lib/security';
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

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Email synthétique pour auth Supabase (login nom + téléphone) */
export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@phone.serviceexpress.ci`;
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
        'Exécutez supabase/SETUP_COMPLET.sql puis MIGRATION_CLIENTS_PARTENAIRES.sql dans Supabase.'
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
  const safeName = sanitizeTextInput(params.name, 80);
  const safePhone = normalizePhone(params.phone ?? '');

  const { data, error } = await tempClient.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        role: params.role,
        zone_id: params.zone_id ?? null,
        name: safeName,
        phone: safePhone,
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

/** Inscription client : nom + téléphone + zone (mot de passe = téléphone) */
export async function registerClient(params: {
  name: string;
  phone: string;
  zone_id: string;
}) {
  const safeName = sanitizeTextInput(params.name, 80);
  const phone = normalizePhone(params.phone);
  if (!safeName) throw new Error('Le nom est requis');
  if (!phone) throw new Error('Le téléphone est requis');

  const email = phoneToAuthEmail(phone);
  const password = phone;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'client',
        name: safeName,
        phone,
        zone_id: params.zone_id,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw new Error('Ce numéro est déjà inscrit. Connectez-vous.');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('Impossible de créer le compte');
  }

  // Si la session n'est pas active (confirm email), se connecter
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  }

  const { data: profile, error: rpcError } = await supabase.rpc('register_client', {
    p_name: safeName,
    p_phone: phone,
    p_zone_id: params.zone_id,
  });

  if (rpcError) throw rpcError;
  return profile as Profile;
}

/** Connexion client : nom + téléphone */
export async function loginClient(name: string, phone: string) {
  const phoneNorm = normalizePhone(phone);

  const { data: email, error: resolveError } = await supabase.rpc('resolve_client_login', {
    p_name: name.trim(),
    p_phone: phoneNorm,
  });

  if (resolveError) throw resolveError;
  if (!email) throw new Error('Compte introuvable');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email),
    password: phoneNorm,
  });

  if (error) {
    // Fallback si l'email en base n'est pas le synthétique
    const fallbackEmail = phoneToAuthEmail(phoneNorm);
    const retry = await supabase.auth.signInWithPassword({
      email: fallbackEmail,
      password: phoneNorm,
    });
    if (retry.error) throw new Error('Identifiants incorrects');
    return retry.data;
  }

  return data;
}

export function getHomeForRole(role?: Role | null): string {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'accountant':
      return '/admin/accounting';
    case 'zone_manager':
      return '/admin/requests';
    case 'partner':
      return '/partenaire';
    case 'worker':
      return '/travailleur';
    case 'client':
      return '/espace';
    default:
      return '/';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message);

    if (message.includes('schema cache') || message.includes('Could not find the')) {
      return 'Exécutez supabase/MIGRATION_CLIENTS_PARTENAIRES.sql dans Supabase → SQL Editor.';
    }
    if (message.includes('duplicate') || message.includes('unique') || message.includes('déjà')) {
      return 'Cet élément existe déjà (email, téléphone ou zone déjà utilisée)';
    }
    if (message.includes('403') || message.includes('permission') || message.includes('42501')) {
      return 'Permission refusée. Vérifiez les scripts SQL Supabase.';
    }
    if (message.includes('Non autorisé')) {
      return 'Action non autorisée.';
    }
    return message;
  }
  return 'Une erreur est survenue';
}
