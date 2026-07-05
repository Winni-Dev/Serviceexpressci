// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '@/contexts/confirm-context';
import { AuthProvider } from '@/contexts/auth-context';
import { PublicLayout } from '@/components/layout/public-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProtectedRoute, AdminEntry } from '@/components/auth/protected-route';
import { RoleRoute } from '@/components/auth/role-route';
import { HomePage } from '@/pages/public/home';
import { ServicesPage as PublicServicesPage } from '@/pages/public/services';
import { ContactPage } from '@/pages/public/contact';
import { RequestFormPage } from '@/pages/public/request-form';
import { DashboardPage } from '@/pages/admin/dashboard';
import { RequestsPage } from '@/pages/admin/requests';
import { WorkersPage } from '@/pages/admin/workers';
import { ManagersPage } from '@/pages/admin/managers';
import { AccountantsPage } from '@/pages/admin/accountants';
import { ZonesPage } from '@/pages/admin/zones';
import { ServicesPage as AdminServicesPage } from '@/pages/admin/services';
import { AccountingPage } from '@/pages/admin/accounting';

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
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/demande" element={<RequestFormPage />} />
            </Route>

            <Route path="/login" element={<Navigate to="/admin" replace />} />

            {/* /admin = login si non connecté, dashboard si connecté */}
            <Route path="/admin" element={<AdminEntry />}>
              <Route index element={<DashboardPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route element={<RoleRoute allowedRoles={['super_admin', 'zone_manager']} />}>
                  <Route path="/admin/requests" element={<RequestsPage />} />
                  <Route path="/admin/workers" element={<WorkersPage />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
                  <Route path="/admin/managers" element={<ManagersPage />} />
                  <Route path="/admin/accountants" element={<AccountantsPage />} />
                  <Route path="/admin/zones" element={<ZonesPage />} />
                  <Route path="/admin/services" element={<AdminServicesPage />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['super_admin', 'accountant']} />}>
                  <Route path="/admin/accounting" element={<AccountingPage />} />
                </Route>

                <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
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
