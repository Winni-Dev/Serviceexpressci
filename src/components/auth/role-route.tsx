import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import { getHomeForRole } from '@/lib/auth';

interface RoleRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RoleRoute({ allowedRoles, redirectTo }: RoleRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    const redirect = redirectTo ?? getHomeForRole(profile?.role);
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
