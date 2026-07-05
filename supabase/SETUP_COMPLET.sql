-- ============================================================
-- SERVICE EXPRESS CI — Script SQL COMPLET
-- Copiez TOUT ce fichier dans Supabase → SQL Editor → Run
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. COLONNES MANQUANTES
-- ────────────────────────────────────────────────────────────
ALTER TABLE zone_managers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE zone_managers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE zone_managers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE zone_managers ALTER COLUMN password DROP NOT NULL;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ────────────────────────────────────────────────────────────
-- 2. FONCTIONS HELPER
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
  SELECT zone_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ────────────────────────────────────────────────────────────
-- 3. FONCTION CONNEXION (crée le profil super_admin)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  u_email TEXT;
  u_meta JSONB;
  profile_count INTEGER;
  assigned_role TEXT;
  result profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT * INTO result FROM profiles WHERE id = uid;
  IF FOUND THEN RETURN result; END IF;

  SELECT email, raw_user_meta_data INTO u_email, u_meta FROM auth.users WHERE id = uid;

  SELECT COUNT(*) INTO profile_count FROM profiles;
  IF profile_count = 0 THEN
    assigned_role := 'super_admin';
  ELSIF u_meta->>'role' IN ('super_admin', 'zone_manager', 'accountant') THEN
    assigned_role := u_meta->>'role';
  ELSE
    assigned_role := 'super_admin';
  END IF;

  INSERT INTO profiles (id, email, role, zone_id)
  VALUES (uid, u_email, assigned_role, NULLIF(u_meta->>'zone_id', '')::uuid)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO anon;

-- ────────────────────────────────────────────────────────────
-- 4. TRIGGER — profil auto à l'inscription
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, zone_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'zone_manager'),
    NULLIF(NEW.raw_user_meta_data->>'zone_id', '')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 5. DROITS D'ACCÈS (GRANT)
-- ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- 6. POLITIQUES ZONES
-- ────────────────────────────────────────────────────────────
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON zones;
DROP POLICY IF EXISTS "zones_select_all" ON zones;
DROP POLICY IF EXISTS "zones_insert_auth" ON zones;
DROP POLICY IF EXISTS "zones_update_auth" ON zones;
DROP POLICY IF EXISTS "zones_delete_auth" ON zones;

CREATE POLICY "zones_select_all" ON zones FOR SELECT USING (true);
CREATE POLICY "zones_insert_auth" ON zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "zones_update_auth" ON zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "zones_delete_auth" ON zones FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────
-- 7. POLITIQUES SERVICES
-- ────────────────────────────────────────────────────────────
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON services;
DROP POLICY IF EXISTS "services_select_all" ON services;
DROP POLICY IF EXISTS "services_insert_auth" ON services;
DROP POLICY IF EXISTS "services_update_auth" ON services;
DROP POLICY IF EXISTS "services_delete_auth" ON services;

CREATE POLICY "services_select_all" ON services FOR SELECT USING (true);
CREATE POLICY "services_insert_auth" ON services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "services_update_auth" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "services_delete_auth" ON services FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────
-- 8. POLITIQUES PROFILES
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated read profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin manage profiles" ON profiles;
DROP POLICY IF EXISTS "Insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE TO authenticated USING (public.get_my_role() = 'super_admin');

-- ────────────────────────────────────────────────────────────
-- 9. POLITIQUES WORKERS
-- ────────────────────────────────────────────────────────────
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON workers;
DROP POLICY IF EXISTS "workers_all_auth" ON workers;

CREATE POLICY "workers_all_auth" ON workers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 10. POLITIQUES ZONE_MANAGERS
-- ────────────────────────────────────────────────────────────
ALTER TABLE zone_managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON zone_managers;
DROP POLICY IF EXISTS "zone_managers_all_auth" ON zone_managers;

CREATE POLICY "zone_managers_all_auth" ON zone_managers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 11. POLITIQUES REQUESTS
-- ────────────────────────────────────────────────────────────
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all users" ON requests;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON requests;
DROP POLICY IF EXISTS "requests_insert_public" ON requests;
DROP POLICY IF EXISTS "requests_select_auth" ON requests;
DROP POLICY IF EXISTS "requests_update_auth" ON requests;

CREATE POLICY "requests_insert_public" ON requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_select_auth" ON requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "requests_update_auth" ON requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "requests_delete_auth" ON requests FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────
-- 12. POLITIQUES ATTENDANCE
-- ────────────────────────────────────────────────────────────
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON attendance;
DROP POLICY IF EXISTS "attendance_all_auth" ON attendance;

CREATE POLICY "attendance_all_auth" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 13. FONCTIONS création comptables / chefs de zone
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_staff_profile(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_zone_id UUID DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result profiles%ROWTYPE;
BEGIN
  IF public.get_my_role() IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  INSERT INTO profiles (id, email, role, zone_id)
  VALUES (p_user_id, p_email, p_role, p_zone_id)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, role = EXCLUDED.role, zone_id = EXCLUDED.zone_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_staff_profile(UUID, TEXT, TEXT, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_zone_manager_record(
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_zone_id UUID,
  p_gender TEXT,
  p_user_id UUID
)
RETURNS zone_managers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result zone_managers%ROWTYPE;
BEGIN
  IF public.get_my_role() IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  IF EXISTS (SELECT 1 FROM zone_managers WHERE zone_id = p_zone_id) THEN
    RAISE EXCEPTION 'Cette zone a déjà un chef de zone assigné';
  END IF;

  INSERT INTO zone_managers (name, phone, email, zone_id, gender, user_id)
  VALUES (p_name, p_phone, p_email, p_zone_id, p_gender, p_user_id)
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_zone_manager_record(TEXT, TEXT, TEXT, UUID, TEXT, UUID) TO authenticated;

-- ────────────────────────────────────────────────────────────
-- 14. PROFIL SUPER ADMIN pour comptes existants
-- ────────────────────────────────────────────────────────────
INSERT INTO profiles (id, email, role)
SELECT u.id, u.email, 'super_admin'
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- ────────────────────────────────────────────────────────────
-- 16. STOCKAGE PHOTOS (travailleurs & chefs de zone)
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-photos', 'staff-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "staff_photos_auth" ON storage.objects;
CREATE POLICY "staff_photos_auth" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'staff-photos')
  WITH CHECK (bucket_id = 'staff-photos');

-- ────────────────────────────────────────────────────────────
-- 17. COMPTABILITÉ — montant total reçu + bénéfice
-- ────────────────────────────────────────────────────────────
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS total_received NUMERIC NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 15. Recharger le cache API Supabase (important après ALTER TABLE)
-- ────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ✅ Terminé ! Déconnectez-vous et reconnectez-vous sur /login
