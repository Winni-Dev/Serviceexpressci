-- ============================================================
-- FIX — Propositions / Photos / Notes / Admin utilisateurs
-- Exécutez dans Supabase → SQL Editor → Run
-- ============================================================

-- 1. Notes (étoiles) sur les missions terminées
CREATE TABLE IF NOT EXISTS worker_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID NOT NULL UNIQUE REFERENCES requests(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE worker_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_select_all" ON worker_ratings;
CREATE POLICY "ratings_select_all" ON worker_ratings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ratings_insert_own" ON worker_ratings;
CREATE POLICY "ratings_insert_own" ON worker_ratings
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Photo sur profiles (partenaire / client)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Notifications : permettre l'insertion système (RPC)
DROP POLICY IF EXISTS "notifications_insert_any" ON notifications;
CREATE POLICY "notifications_insert_any" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Propositions lisibles par tous les authentifiés (clients inclus)
DROP POLICY IF EXISTS "proposals_select" ON request_proposals;
CREATE POLICY "proposals_select" ON request_proposals
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "proposals_insert" ON request_proposals;
CREATE POLICY "proposals_insert" ON request_proposals
  FOR INSERT TO authenticated WITH CHECK (true);

-- Workers lisibles (photo visible sur propositions)
DROP POLICY IF EXISTS "workers_select_all" ON workers;
CREATE POLICY "workers_select_all" ON workers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "workers_all_auth" ON workers;
CREATE POLICY "workers_all_auth" ON workers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "worker_zones_select" ON worker_zones;
CREATE POLICY "worker_zones_select" ON worker_zones
  FOR SELECT TO authenticated USING (true);

-- Admin voit tous les profils
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.get_my_role() = 'super_admin'
    OR public.get_my_role() IN ('partner', 'zone_manager', 'worker', 'accountant')
  );

-- 3. submit_proposal : photo obligatoire + notif fiable
CREATE OR REPLACE FUNCTION public.submit_proposal(
  p_request_id UUID,
  p_amount DECIMAL,
  p_message TEXT DEFAULT NULL
)
RETURNS request_proposals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  w workers%ROWTYPE;
  req requests%ROWTYPE;
  result request_proposals%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT * INTO w FROM workers WHERE user_id = uid AND status = 'active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profil travailleur introuvable'; END IF;

  IF w.photo_url IS NULL OR trim(w.photo_url) = '' THEN
    RAISE EXCEPTION 'Ajoutez une photo de profil avant de proposer un prix';
  END IF;

  SELECT * INTO req FROM requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Demande introuvable'; END IF;
  IF req.status <> 'new' THEN RAISE EXCEPTION 'Cette demande n''accepte plus de propositions'; END IF;
  IF req.service_id IS DISTINCT FROM w.service_id THEN
    RAISE EXCEPTION 'Service non correspondant';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM worker_zones wz WHERE wz.worker_id = w.id AND wz.zone_id = req.zone_id
  ) AND w.zone_id IS DISTINCT FROM req.zone_id THEN
    RAISE EXCEPTION 'Zone non correspondant';
  END IF;

  INSERT INTO request_proposals (request_id, worker_id, amount, message)
  VALUES (p_request_id, w.id, p_amount, p_message)
  ON CONFLICT (request_id, worker_id) DO UPDATE
    SET amount = EXCLUDED.amount, message = EXCLUDED.message, status = 'pending'
  RETURNING * INTO result;

  -- Notifier le client (client_id ou téléphone)
  IF req.client_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, link, meta)
    VALUES (
      req.client_id,
      'Nouvelle proposition',
      COALESCE(w.name, 'Un professionnel') || ' propose ' || p_amount::text || ' FCFA.',
      'new_proposal',
      '/espace',
      jsonb_build_object('request_id', p_request_id, 'proposal_id', result.id)
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_proposal(UUID, DECIMAL, TEXT) TO authenticated;

-- 4. Noter un travailleur après mission terminée
CREATE OR REPLACE FUNCTION public.rate_worker(
  p_request_id UUID,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS worker_ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  req requests%ROWTYPE;
  result worker_ratings%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  IF p_rating < 1 OR p_rating > 5 THEN RAISE EXCEPTION 'Note invalide (1 à 5)'; END IF;

  SELECT * INTO req FROM requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Demande introuvable'; END IF;
  IF req.client_id IS DISTINCT FROM uid THEN RAISE EXCEPTION 'Non autorisé'; END IF;
  IF req.status <> 'done' THEN RAISE EXCEPTION 'Vous ne pouvez noter que les missions terminées'; END IF;
  IF req.worker_id IS NULL THEN RAISE EXCEPTION 'Aucun travailleur assigné'; END IF;
  IF EXISTS (SELECT 1 FROM worker_ratings WHERE request_id = p_request_id) THEN
    RAISE EXCEPTION 'Vous avez déjà noté cette mission';
  END IF;

  INSERT INTO worker_ratings (request_id, worker_id, client_id, rating, comment)
  VALUES (p_request_id, req.worker_id, uid, p_rating, p_comment)
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rate_worker(UUID, INTEGER, TEXT) TO authenticated;

-- 5. Mise à jour profil travailleur (photo, service, zones)
CREATE OR REPLACE FUNCTION public.update_my_worker_profile(
  p_photo_url TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL,
  p_zone_ids UUID[] DEFAULT NULL,
  p_name TEXT DEFAULT NULL
)
RETURNS workers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  w_id UUID;
  result workers%ROWTYPE;
  z UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT id INTO w_id FROM workers WHERE user_id = uid LIMIT 1;
  IF w_id IS NULL THEN RAISE EXCEPTION 'Profil travailleur introuvable'; END IF;

  UPDATE workers SET
    photo_url = COALESCE(NULLIF(p_photo_url, ''), photo_url),
    service_id = COALESCE(p_service_id, service_id),
    name = COALESCE(NULLIF(trim(p_name), ''), name),
    zone_id = CASE
      WHEN p_zone_ids IS NOT NULL AND array_length(p_zone_ids, 1) >= 1
        THEN p_zone_ids[1]
      ELSE zone_id
    END
  WHERE id = w_id
  RETURNING * INTO result;

  IF p_zone_ids IS NOT NULL THEN
    DELETE FROM worker_zones WHERE worker_id = w_id;
    FOREACH z IN ARRAY p_zone_ids LOOP
      INSERT INTO worker_zones (worker_id, zone_id) VALUES (w_id, z)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Sync photo sur profiles
  IF p_photo_url IS NOT NULL AND trim(p_photo_url) <> '' THEN
    UPDATE profiles SET photo_url = p_photo_url, name = COALESCE(NULLIF(trim(p_name), ''), name)
    WHERE id = uid;
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_worker_profile(TEXT, UUID, UUID[], TEXT) TO authenticated;

-- 6. Photo partenaire
CREATE OR REPLACE FUNCTION public.update_my_partner_photo(p_photo_url TEXT)
RETURNS partners
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  result partners%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  IF p_photo_url IS NULL OR trim(p_photo_url) = '' THEN
    RAISE EXCEPTION 'Photo requise';
  END IF;

  UPDATE partners SET photo_url = p_photo_url WHERE user_id = uid
  RETURNING * INTO result;

  IF NOT FOUND THEN
    -- créer fiche partenaire minimale si absente
    INSERT INTO partners (user_id, name, phone, photo_url)
    SELECT id, COALESCE(name, 'Partenaire'), COALESCE(phone, ''), p_photo_url
    FROM profiles WHERE id = uid
    ON CONFLICT (user_id) DO UPDATE SET photo_url = EXCLUDED.photo_url
    RETURNING * INTO result;
  END IF;

  UPDATE profiles SET photo_url = p_photo_url WHERE id = uid;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_partner_photo(TEXT) TO authenticated;

-- 7. Vue moyenne notes
CREATE OR REPLACE VIEW public.worker_rating_stats
WITH (security_invoker = true) AS
SELECT
  worker_id,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*)::int AS rating_count
FROM worker_ratings
GROUP BY worker_id;

ALTER VIEW public.worker_rating_stats SET (security_invoker = true);
GRANT SELECT ON public.worker_rating_stats TO authenticated, anon;

NOTIFY pgrst, 'reload schema';
