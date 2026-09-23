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
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl shadow-[#0A2240]/5 overflow-hidden">
        <div className="bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-6 py-8 text-white text-center">
          <div className="flex justify-center mb-3">
            <BrandLogo showText={false} size="md" />
          </div>
          <h1 className="text-xl font-bold">
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {isRegister
              ? 'Inscrivez-vous pour faire des demandes de service'
              : 'Connectez-vous avec votre nom et votre numéro'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {isRegister ? (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom complet</label>
                <Input {...registerForm.register('name')} placeholder="Votre nom" className="rounded-xl h-11" />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Numéro de téléphone</label>
                <Input
                  {...registerForm.register('phone')}
                  type="tel"
                  placeholder="07XXXXXXXX"
                  className="rounded-xl h-11"
                />
                {registerForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Localisation (zone)</label>
                <FormSearchableSelect
                  control={registerForm.control}
                  name="zone_id"
                  options={zoneOptions}
                  placeholder="Choisir votre zone"
                  searchPlaceholder="Rechercher une zone..."
                />
                {registerForm.formState.errors.zone_id && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.zone_id.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 bg-[#FF6600] hover:bg-[#e55a00]" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                S'inscrire
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom complet</label>
                <Input {...loginForm.register('name')} placeholder="Votre nom" className="rounded-xl h-11" />
                {loginForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Numéro de téléphone</label>
                <Input
                  {...loginForm.register('phone')}
                  type="tel"
                  placeholder="07XXXXXXXX"
                  className="rounded-xl h-11"
                />
                {loginForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.phone.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 bg-[#FF6600] hover:bg-[#e55a00]" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Se connecter
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            {isRegister ? (
              <>
                Déjà un compte ?{' '}
                <Link to="/connexion" state={location.state} className="text-[#FF6600] font-medium">
                  Se connecter
                </Link>
              </>
            ) : (
              <>
                Pas encore de compte ?{' '}
                <Link to="/inscription" state={location.state} className="text-[#FF6600] font-medium">
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
