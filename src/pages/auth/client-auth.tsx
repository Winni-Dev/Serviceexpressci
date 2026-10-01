import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
import { BrandLogo } from '@/components/shared/brand-logo';
import { useZones } from '@/hooks/useZones';
import { registerClient, loginClient, getErrorMessage, getHomeForRole } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(8, 'Numéro invalide'),
  zone_id: z.string().min(1, 'Choisissez votre localisation'),
});

const loginSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(8, 'Numéro invalide'),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export function ClientAuthPage({ mode }: { mode: 'register' | 'login' }) {
  const isRegister = mode === 'register';
  const { data: zones } = useZones();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from;

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];

  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const profile = await registerClient(data);
      await refreshProfile();
      navigate(redirectTo || getHomeForRole(profile.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await loginClient(data.name, data.phone);
      await refreshProfile();
      // profile will load via auth context; navigate after short delay or use returned session
      navigate(redirectTo || '/espace', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#2D2D2D] bg-[#141414] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-[#2D2D2D] bg-[#0A0A0A] px-6 py-8 text-center">
          <div className="mb-3 flex justify-center">
            <BrandLogo showText={false} size="md" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            {isRegister
              ? 'Inscrivez-vous pour faire des demandes de service'
              : 'Connectez-vous avec votre nom et votre numéro'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {isRegister ? (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Nom complet</label>
                <Input {...registerForm.register('name')} placeholder="Votre nom" className="h-11 rounded-xl" />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-300">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Numéro de téléphone</label>
                <Input
                  {...registerForm.register('phone')}
                  type="tel"
                  placeholder="07XXXXXXXX"
                  className="h-11 rounded-xl"
                />
                {registerForm.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-300">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Localisation (zone)</label>
                <FormSearchableSelect
                  control={registerForm.control}
                  name="zone_id"
                  options={zoneOptions}
                  placeholder="Choisir votre zone"
                  searchPlaceholder="Rechercher une zone..."
                />
                {registerForm.formState.errors.zone_id && (
                  <p className="mt-1 text-xs text-red-300">{registerForm.formState.errors.zone_id.message}</p>
                )}
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                S'inscrire
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Nom complet</label>
                <Input {...loginForm.register('name')} placeholder="Votre nom" className="h-11 rounded-xl" />
                {loginForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-300">{loginForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#F5F5F5]">Numéro de téléphone</label>
                <Input
                  {...loginForm.register('phone')}
                  type="tel"
                  placeholder="07XXXXXXXX"
                  className="h-11 rounded-xl"
                />
                {loginForm.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-300">{loginForm.formState.errors.phone.message}</p>
                )}
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Se connecter
              </Button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-[#A0A0A0]">
            {isRegister ? (
              <>
                Déjà un compte ?{' '}
                <Link to="/connexion" state={location.state} className="font-medium text-[#FEC18A] transition-colors hover:text-[#D99A5B]">
                  Se connecter
                </Link>
              </>
            ) : (
              <>
                Pas encore de compte ?{' '}
                <Link to="/inscription" state={location.state} className="font-medium text-[#FEC18A] transition-colors hover:text-[#D99A5B]">
                  S'inscrire
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return <ClientAuthPage mode="register" />;
}

export function ClientLoginPage() {
  return <ClientAuthPage mode="login" />;
}
