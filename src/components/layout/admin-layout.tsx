import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  Wrench,
  ClipboardList,
  DollarSign,
  LogOut,
  Menu,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { BrandLogo } from '@/components/shared/brand-logo';
import type { Role } from '@/types';

const allNavigation: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'zone_manager'] },
  { name: 'Demandes', href: '/admin/requests', icon: ClipboardList, roles: ['super_admin', 'zone_manager'] },
  { name: 'Travailleurs', href: '/admin/workers', icon: Users, roles: ['super_admin', 'zone_manager'] },
  { name: 'Chefs de zone', href: '/admin/managers', icon: UserCheck, roles: ['super_admin'] },
  { name: 'Comptables', href: '/admin/accountants', icon: Calculator, roles: ['super_admin'] },
  { name: 'Zones', href: '/admin/zones', icon: MapPin, roles: ['super_admin'] },
  { name: 'Services', href: '/admin/services', icon: Wrench, roles: ['super_admin'] },
  { name: 'Comptabilité', href: '/admin/accounting', icon: DollarSign, roles: ['super_admin', 'accountant'] },
];

const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  zone_manager: 'Chef de zone',
  accountant: 'Comptable',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, session } = useAuth();

  const navigation = allNavigation.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      description: 'Voulez-vous vraiment vous déconnecter de votre compte ?',
      confirmText: 'Se déconnecter',
      cancelText: 'Annuler',
      variant: 'warning',
    });
    if (!ok) return;
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const initials = profile?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0A2240] text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10">
          <BrandLogo
            to={navigation[0]?.href || '/admin'}
            textClassName="text-white text-base"
            size="md"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.href
                  ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/20'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-[#0A2240]" />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF6600] to-[#e55a00] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {initials}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-[#0A2240]">{session?.user?.email}</p>
                <p className="text-gray-400 text-xs">{profile ? roleLabels[profile.role] : ''}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
