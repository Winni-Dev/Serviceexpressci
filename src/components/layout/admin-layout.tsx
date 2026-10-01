// import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import {
//   LayoutDashboard,
//   Users,
//   UserCheck,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   DollarSign,
//   LogOut,
//   Menu,
//   Calculator,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/contexts/auth-context';
// import { useConfirm } from '@/contexts/confirm-context';
// import { BrandLogo } from '@/components/shared/brand-logo';
// import type { Role } from '@/types';

// const allNavigation: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
//   { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'zone_manager'] },
//   { name: 'Demandes', href: '/admin/requests', icon: ClipboardList, roles: ['super_admin', 'zone_manager'] },
//   { name: 'Travailleurs', href: '/admin/workers', icon: Users, roles: ['super_admin', 'zone_manager'] },
//   { name: 'Chefs de zone', href: '/admin/managers', icon: UserCheck, roles: ['super_admin'] },
//   { name: 'Comptables', href: '/admin/accountants', icon: Calculator, roles: ['super_admin'] },
//   { name: 'Zones', href: '/admin/zones', icon: MapPin, roles: ['super_admin'] },
//   { name: 'Services', href: '/admin/services', icon: Wrench, roles: ['super_admin'] },
//   { name: 'Comptabilité', href: '/admin/accounting', icon: DollarSign, roles: ['super_admin', 'accountant'] },
// ];

// const roleLabels: Record<Role, string> = {
//   super_admin: 'Super Admin',
//   zone_manager: 'Chef de zone',
//   accountant: 'Comptable',
// };

// export function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { profile, session } = useAuth();

//   const navigation = allNavigation.filter(
//     (item) => profile && item.roles.includes(profile.role)
//   );

//   const { confirm } = useConfirm();

//   const handleLogout = async () => {
//     const ok = await confirm({
//       title: 'Déconnexion',
//       description: 'Voulez-vous vraiment vous déconnecter de votre compte ?',
//       confirmText: 'Se déconnecter',
//       cancelText: 'Annuler',
//       variant: 'warning',
//     });
//     if (!ok) return;
//     await supabase.auth.signOut();
//     navigate('/admin');
//   };

//   const initials = profile?.email?.charAt(0).toUpperCase() || 'A';

//   return (
//     <div className="min-h-screen bg-[#f4f6f9]">
//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
//       )}

//       <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0A2240] text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <div className="p-5 border-b border-white/10">
//           <BrandLogo
//             to={navigation[0]?.href || '/admin'}
//             textClassName="text-white text-base"
//             size="md"
//             onClick={() => setSidebarOpen(false)}
//           />
//         </div>

//         <nav className="px-3 py-4 space-y-1">
//           {navigation.map((item) => (
//             <Link
//               key={item.name}
//               to={item.href}
//               className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                 location.pathname === item.href
//                   ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/20'
//                   : 'text-white/70 hover:bg-white/10 hover:text-white'
//               }`}
//               onClick={() => setSidebarOpen(false)}
//             >
//               <item.icon className="w-4 h-4" />
//               <span>{item.name}</span>
//             </Link>
//           ))}
//         </nav>

//         <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
//           <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl" onClick={handleLogout}>
//             <LogOut className="w-4 h-4 mr-2" />
//             Déconnexion
//           </Button>
//         </div>
//       </aside>

//       <div className="lg:pl-64">
//         <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
//           <div className="flex items-center justify-between h-14 px-4 md:px-6">
//             <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
//               <Menu className="w-5 h-5 text-[#0A2240]" />
//             </button>
//             <div className="flex items-center gap-3 ml-auto">
//               <div className="w-8 h-8 bg-gradient-to-br from-[#FF6600] to-[#e55a00] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
//                 {initials}
//               </div>
//               <div className="hidden md:block text-sm">
//                 <p className="font-medium text-[#0A2240]">{session?.user?.email}</p>
//                 <p className="text-gray-400 text-xs">{profile ? roleLabels[profile.role] : ''}</p>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="p-4 md:p-6 max-w-[1400px]">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }


import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  X,
  BadgeCheck,
  Contact,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { BrandLogo } from '@/components/shared/brand-logo';
import { RefreshDataButton } from '@/components/shared/refresh-data-button';
import { motion, AnimatePresence } from 'framer-motion';
import type { Role } from '@/types';

const allNavigation: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'zone_manager'] },
  { name: 'Demandes', href: '/admin/requests', icon: ClipboardList, roles: ['super_admin', 'zone_manager'] },
  { name: 'Travailleurs', href: '/admin/workers', icon: Users, roles: ['super_admin', 'zone_manager'] },
  { name: 'Utilisateurs', href: '/admin/users', icon: Contact, roles: ['super_admin'] },
  { name: 'Demandes de rôle', href: '/admin/role-requests', icon: BadgeCheck, roles: ['super_admin'] },
  { name: 'Partenaires', href: '/admin/managers', icon: UserCheck, roles: ['super_admin'] },
  { name: 'Comptables', href: '/admin/accountants', icon: Calculator, roles: ['super_admin'] },
  { name: 'Zones', href: '/admin/zones', icon: MapPin, roles: ['super_admin'] },
  { name: 'Services', href: '/admin/services', icon: Wrench, roles: ['super_admin'] },
  { name: 'Catégories', href: '/admin/categories', icon: FolderOpen, roles: ['super_admin'] },
  { name: 'Comptabilité', href: '/admin/accounting', icon: DollarSign, roles: ['super_admin', 'accountant'] },
];

const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  zone_manager: 'Partenaire',
  accountant: 'Comptable',
  client: 'Client',
  partner: 'Partenaire',
  worker: 'Travailleur',
};

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, session } = useAuth();
  const { confirm } = useConfirm();

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navigation = allNavigation.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

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

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[240px]';

  return (
    <div className="min-h-screen bg-[#000000]">
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 72 : 240,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-4 left-4 z-50
          ${sidebarWidth}
          h-[calc(100vh-2rem)]
          bg-[#121212]
          border border-[#27272A]
          rounded-2xl
          shadow-[0_20px_40px_rgba(0,0,0,0.5)]
          flex flex-col
          transition-all duration-300
          overflow-hidden
          ${isCollapsed ? 'items-center' : ''}
          ${isMobileOpen ? 'flex' : 'hidden'}
          lg:flex
        `}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-3 right-3 z-20 flex lg:hidden items-center justify-center w-8 h-8 rounded-full bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            absolute z-20
            flex items-center justify-center
            w-7 h-7 rounded-full
            bg-[#C27D3D] hover:bg-[#D99A5B]
            border border-[#D99A5B]/40
            text-[#000000]
            shadow-[0_8px_18px_rgba(194,125,61,0.25)]
            transition-all duration-200
            group
            hover:scale-105
            hidden lg:flex
            ${isCollapsed ? 'bottom-16 left-1/2 -translate-x-1/2' : 'top-3 right-3'}
          `}
          title={isCollapsed ? 'Développer' : 'Réduire'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} pt-5 pb-3.5 border-b border-[#27272A] flex-shrink-0 w-full`}>
          {isCollapsed ? (
            <Link to={navigation[0]?.href || '/admin'} className="flex items-center justify-center">
              <img src="/favicon.jpeg" alt="Service Express CI" className="w-9 h-9 object-cover rounded-xl" />
            </Link>
          ) : (
            <BrandLogo
              to={navigation[0]?.href || '/admin'}
              textClassName="text-white text-sm"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
        </div>

        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} py-3 overflow-y-auto w-full`}>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[rgba(194,125,61,0.15)] text-[#D99A5B] border border-[#C27D3D]/30 shadow-[0_6px_16px_rgba(194,125,61,0.12)]'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D99A5B]' : 'text-zinc-400'}`} />
                  {!isCollapsed && <span>{item.name}</span>}

                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D99A5B]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={`flex-shrink-0 border-t border-[#27272A] ${isCollapsed ? 'px-2' : 'px-3'} py-3 w-full`}>
          <Button
            variant="ghost"
            className={`
              text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200
              ${isCollapsed ? 'w-full px-0 justify-center' : 'w-full justify-start px-3'}
            `}
            onClick={handleLogout}
            title={isCollapsed ? 'Déconnexion' : ''}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2 text-xs sm:text-sm">Déconnexion</span>}
          </Button>
        </div>
      </motion.aside>

      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[256px]'} pl-4 pr-4`}>
        <header className="sticky top-4 z-30 bg-[#121212]/90 backdrop-blur-xl border border-[#27272A] rounded-xl sm:rounded-2xl shadow-sm">
          <div className="flex items-center justify-between h-13 px-4 md:px-5">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-[#27272A] text-zinc-300"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="w-4 h-4 text-white" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C27D3D]"></span>
                <span className="text-zinc-200 font-medium">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <RefreshDataButton variant="outline" label="Rafraîchir" />
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="text-zinc-500">Connecté :</span>
                <span className="font-medium text-white">{session?.user?.email}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C27D3D] to-[#D99A5B] flex items-center justify-center text-[#000000] text-xs font-bold shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}