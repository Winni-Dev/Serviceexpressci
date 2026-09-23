-- Script de sécurisation Supabase pour bloquer l'accès non autorisé aux tables admin.
-- À exécuter dans l'éditeur SQL de Supabase.

-- 1) Activer le Row Level Security sur les tables sensibles si elles existent.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.requests') IS NOT NULL THEN ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.workers') IS NOT NULL THEN ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.zones') IS NOT NULL THEN ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.services') IS NOT NULL THEN ALTER TABLE public.services ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.service_categories') IS NOT NULL THEN ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.partner_applications') IS NOT NULL THEN ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.worker_invitations') IS NOT NULL THEN ALTER TABLE public.worker_invitations ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.zone_managers') IS NOT NULL THEN ALTER TABLE public.zone_managers ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.accountants') IS NOT NULL THEN ALTER TABLE public.accountants ENABLE ROW LEVEL SECURITY; END IF;
  IF to_regclass('public.worker_ratings') IS NOT NULL THEN ALTER TABLE public.worker_ratings ENABLE ROW LEVEL SECURITY; END IF;
END $$;

-- 2) Public read only pour les catalogues visibles par tous.
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_public_read" ON public.service_categories;
CREATE POLICY "categories_public_read" ON public.service_categories
FOR SELECT USING (true);

DROP POLICY IF EXISTS "zones_public_read" ON public.zones;
CREATE POLICY "zones_public_read" ON public.zones
FOR SELECT USING (true);

-- 3) Les profils sont privés : un utilisateur ne voit que son propre profil.
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4) Les demandes clients ne sont visibles que par leur client et par les admins autorisés.
DROP POLICY IF EXISTS "requests_client_and_admin_access" ON public.requests;
CREATE POLICY "requests_client_and_admin_access" ON public.requests
FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager', 'accountant')
  )
);

DROP POLICY IF EXISTS "requests_client_insert" ON public.requests;
CREATE POLICY "requests_client_insert" ON public.requests
FOR INSERT WITH CHECK (
  auth.uid() = client_id
  AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "requests_admin_update" ON public.requests;
CREATE POLICY "requests_admin_update" ON public.requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager', 'accountant')
  )
);

-- 5) Les travailleurs et la structure interne sont accessibles uniquement aux admins ou aux propres utilisateurs.
DROP POLICY IF EXISTS "workers_admin_or_self_access" ON public.workers;
CREATE POLICY "workers_admin_or_self_access" ON public.workers
FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager', 'accountant')
  )
);

DROP POLICY IF EXISTS "workers_admin_modify" ON public.workers;
CREATE POLICY "workers_admin_modify" ON public.workers
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'zone_manager')
  )
);

-- 6) Interdire totalement tout accès anonyme aux tables de gestion.
DROP POLICY IF EXISTS "deny_anon_all_profiles" ON public.profiles;
CREATE POLICY "deny_anon_all_profiles" ON public.profiles
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deny_anon_all_requests" ON public.requests;
CREATE POLICY "deny_anon_all_requests" ON public.requests
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deny_anon_all_workers" ON public.workers;
CREATE POLICY "deny_anon_all_workers" ON public.workers
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deny_anon_all_zones" ON public.zones;
CREATE POLICY "deny_anon_all_zones" ON public.zones
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 7) Sécurité supplémentaire : les tables non mentionnées restent fermées par défaut.
-- Aucune table de gestion ne doit être lisible par un visiteur anonyme sans auth.uid().

-- 8) Vérification rapide : les politiques doivent rendre les tables admin inaccessibles à l'anonyme.
-- Test conseillé :
-- SELECT * FROM public.profiles; -- doit renvoyer "permission denied" pour auth non connectée.
