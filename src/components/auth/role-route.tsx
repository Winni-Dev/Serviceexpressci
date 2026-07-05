import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    const redirect =
      profile?.role === 'accountant'
        ? '/admin/accounting'
        : profile?.role === 'zone_manager'
          ? '/admin/requests'
          : '/admin';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
