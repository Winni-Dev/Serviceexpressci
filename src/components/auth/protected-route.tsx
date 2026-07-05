import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { LoginPage } from '@/pages/auth/login';
import { AdminLayout } from '@/components/layout/admin-layout';
import type { Role } from '@/types';

function getDefaultRoute(role?: Role) {
  switch (role) {
    case 'accountant':
      return '/admin/accounting';
    case 'zone_manager':
      return '/admin/requests';
    default:
      return '/admin';
  }
}

/** Point d'entrée /admin : login si non connecté, dashboard si connecté */
export function AdminEntry() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  if (profile?.role === 'accountant') {
    return <Navigate to="/admin/accounting" replace />;
  }

  return <AdminLayout />;
}

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export { getDefaultRoute };
