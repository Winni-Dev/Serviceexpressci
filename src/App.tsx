// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '@/contexts/confirm-context';
import { AuthProvider } from '@/contexts/auth-context';
import { PublicLayout } from '@/components/layout/public-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { UserSpaceLayout } from '@/components/layout/user-space-layout';
import { AdminEntry, AdminProtectedRoute, UserSpaceEntry } from '@/components/auth/protected-route';
import { RoleRoute } from '@/components/auth/role-route';
import { HomePage } from '@/pages/public/home';
import { ServicesPage as PublicServicesPage } from '@/pages/public/services';
import { RequestFormPage } from '@/pages/public/request-form';
import { RegisterPage, ClientLoginPage } from '@/pages/auth/client-auth';
import { DashboardPage } from '@/pages/admin/dashboard';
import { RequestsPage } from '@/pages/admin/requests';
import { WorkersPage } from '@/pages/admin/workers';
import { ManagersPage } from '@/pages/admin/managers';
import { AccountantsPage } from '@/pages/admin/accountants';
import { ZonesPage } from '@/pages/admin/zones';
import { ServicesPage as AdminServicesPage } from '@/pages/admin/services';
import { CategoriesPage } from '@/pages/admin/categories';
import { AccountingPage } from '@/pages/admin/accounting';
import { RoleRequestsPage } from '@/pages/admin/role-requests';
import { ClientEspacePage } from '@/pages/espace/client-dashboard';
import { BecomePartnerPage } from '@/pages/espace/become-partner';
import { InvitationsPage } from '@/pages/espace/invitations';
import { PartnerDashboardPage } from '@/pages/partenaire/dashboard';
import { PartnerWorkersPage } from '@/pages/partenaire/workers';
import { ProfilePage } from '@/pages/espace/profile';
import { AdminUsersPage } from '@/pages/admin/users';
import { WorkerDashboardPage } from '@/pages/travailleur/dashboard';
import { WorkerRequestsPage } from '@/pages/travailleur/requests';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<PublicServicesPage />} />
                <Route path="/contact" element={<Navigate to="/" replace />} />
                <Route path="/demande" element={<RequestFormPage />} />
                <Route path="/inscription" element={<RegisterPage />} />
                <Route path="/connexion" element={<ClientLoginPage />} />
              </Route>

              <Route path="/login" element={<Navigate to="/admin" replace />} />

              <Route path="/admin" element={<AdminEntry />}>
                <Route index element={<DashboardPage />} />
              </Route>

              <Route element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route element={<RoleRoute allowedRoles={['super_admin', 'zone_manager']} />}>
                    <Route path="/admin/requests" element={<RequestsPage />} />
                    <Route path="/admin/workers" element={<WorkersPage />} />
                  </Route>

                  <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
                    <Route path="/admin/managers" element={<ManagersPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/role-requests" element={<RoleRequestsPage />} />
                    <Route path="/admin/accountants" element={<AccountantsPage />} />
                    <Route path="/admin/zones" element={<ZonesPage />} />
                    <Route path="/admin/services" element={<AdminServicesPage />} />
                    <Route path="/admin/categories" element={<CategoriesPage />} />
                  </Route>

                  <Route element={<RoleRoute allowedRoles={['super_admin', 'accountant']} />}>
                    <Route path="/admin/accounting" element={<AccountingPage />} />
                  </Route>

                  <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Route>

              <Route element={<UserSpaceEntry />}>
                <Route element={<UserSpaceLayout />}>
                  <Route path="/espace" element={<ClientEspacePage />} />
                  <Route path="/espace/profil" element={<ProfilePage />} />
                  <Route path="/espace/devenir-partenaire" element={<BecomePartnerPage />} />
                  <Route path="/espace/invitations" element={<InvitationsPage />} />

                  <Route element={<RoleRoute allowedRoles={['partner', 'zone_manager']} redirectTo="/espace" />}>
                    <Route path="/partenaire" element={<PartnerDashboardPage />} />
                    <Route path="/partenaire/travailleurs" element={<PartnerWorkersPage />} />
                  </Route>

                  <Route element={<RoleRoute allowedRoles={['worker', 'partner']} redirectTo="/espace" />}>
                    <Route path="/travailleur" element={<WorkerDashboardPage />} />
                    <Route path="/travailleur/demandes" element={<WorkerRequestsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ConfirmProvider>
    </QueryClientProvider>
  );
}

export default App;
