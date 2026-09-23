import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { LoginPage } from '@/pages/auth/login';
import { AdminLayout } from '@/components/layout/admin-layout';
import type { Role } from '@/types';
import { getHomeForRole } from '@/lib/auth';

function getDefaultRoute(role?: Role) {
  switch (role) {
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
      return '/admin';
  }
}

const ADMIN_ROLES: Role[] = ['super_admin', 'zone_manager', 'accountant'];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
    </div>
  );
}

/** Point d'entrée /admin : login si non connecté, dashboard si connecté */
export function AdminEntry() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <LoginPage />;
  }

  if (profile && !ADMIN_ROLES.includes(profile.role)) {
    return <Navigate to={getHomeForRole(profile.role)} replace />;
  }

  if (profile?.role === 'accountant') {
    return <Navigate to="/admin/accounting" replace />;
  }

  return <AdminLayout />;
}

/** Routes admin protégées */
export function AdminProtectedRoute() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/admin" replace />;

  if (profile && !ADMIN_ROLES.includes(profile.role)) {
    return <Navigate to={getHomeForRole(profile.role)} replace />;
  }

  return <Outlet />;
}

/** Routes espace client / partenaire / travailleur */
export function UserSpaceEntry() {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  if (profile?.role === 'super_admin' || profile?.role === 'accountant') {
    return <Navigate to={getDefaultRoute(profile.role)} replace />;
  }

  return <Outlet />;
}

/** @deprecated use AdminProtectedRoute */
export function ProtectedRoute() {
  return <AdminProtectedRoute />;
}

export { getDefaultRoute };
