import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/brand-logo';
import { RefreshDataButton } from '@/components/shared/refresh-data-button';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BadgeCheck,
  LogOut,
  Bell,
  User,
  Home,
} from 'lucide-react';
import type { Role } from '@/types';
import { useConfirm } from '@/contexts/confirm-context';

const navByRole: Record<string, { to: string; label: string; short: string; icon: typeof User }[]> = {
  client: [
    { to: '/espace', label: 'Mes demandes', short: 'Demandes', icon: ClipboardList },
    { to: '/espace/invitations', label: 'Invitations', short: 'Invit.', icon: Bell },
    { to: '/espace/devenir-partenaire', label: 'Devenir partenaire', short: 'Partenaire', icon: BadgeCheck },
    { to: '/espace/profil', label: 'Mon profil', short: 'Profil', icon: User },
  ],
  partner: [
    { to: '/partenaire', label: 'Tableau de bord', short: 'Dashboard', icon: LayoutDashboard },
    { to: '/partenaire/travailleurs', label: 'Travailleurs', short: 'Équipe', icon: Users },
    { to: '/espace', label: 'Mes demandes', short: 'Demandes', icon: ClipboardList },
    { to: '/espace/profil', label: 'Mon profil', short: 'Profil', icon: User },
  ],
  worker: [
    { to: '/travailleur', label: 'Tableau de bord', short: 'Dashboard', icon: LayoutDashboard },
    { to: '/travailleur/demandes', label: 'Demandes', short: 'Missions', icon: ClipboardList },
    { to: '/espace', label: 'Mes demandes client', short: 'Client', icon: ClipboardList },
    { to: '/espace/profil', label: 'Mon profil', short: 'Profil', icon: User },
  ],
};

function linksFor(role?: Role | null) {
  if (!role) return navByRole.client;
  if (role === 'partner' || role === 'zone_manager') return navByRole.partner;
  if (role === 'worker') return navByRole.worker;
  return navByRole.client;
}

export function UserSpaceLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const links = linksFor(profile?.role);

  const logout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      description: 'Voulez-vous vous déconnecter ?',
      confirmText: 'Se déconnecter',
      cancelText: 'Annuler',
      variant: 'warning',
    });
    if (!ok) return;
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#000000] pb-20 lg:pb-0 text-white">
      <header className="sticky top-0 z-40 bg-[#0A0A0A] text-white border-b border-[#2D2D2D]">
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <BrandLogo to="/" showText={false} size="sm" />
          <div className="min-w-0 flex-1 px-2">
            <p className="text-xs text-[#A0A0A0] truncate">Mon espace</p>
            <p className="text-sm font-medium truncate text-white">
              {profile?.name || profile?.phone || 'Compte'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Retour au site</span>
              </Link>
            </Button>
            <RefreshDataButton dark />
            <Button
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9 p-0"
              onClick={logout}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 grid lg:grid-cols-[220px_1fr] gap-5">
        <aside className="hidden lg:block bg-[#141414] rounded-2xl border border-[#2D2D2D] p-3 h-fit sticky top-20 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <nav className="space-y-1">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/espace' || item.to === '/partenaire' || item.to === '/travailleur'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#C27D3D]/10 text-[#FEC18A] border border-[#C27D3D]/20'
                    : 'text-[#F5F5F5]/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#FEC18A] bg-[#C27D3D]/10 hover:bg-[#C27D3D]/15 border border-[#C27D3D]/15"
            >
              <Home className="w-4 h-4" />
              Retour au site
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[#2D2D2D] bg-[#141414]/95 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-0.5 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {links.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/espace' || item.to === '/partenaire' || item.to === '/travailleur'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-colors ${isActive ? 'text-[#FEC18A] bg-[#C27D3D]/10' : 'text-[#A0A0A0]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-[4.5rem]">{item.short}</span>
            </NavLink>
          ))}
          <Link
            to="/"
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold text-[#FEC18A]"
          >
            <Home className="w-5 h-5" />
            <span>Site</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
