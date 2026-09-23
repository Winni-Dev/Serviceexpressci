-- ============================================================
-- FIX rapide — photo proposition + lecture demandes client
-- Exécutez dans Supabase → SQL Editor → Run
-- ============================================================

-- Photo : accepter aussi la photo du profil si workers.photo_url vide
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
  profile_photo TEXT;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT * INTO w FROM workers WHERE user_id = uid AND status = 'active' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profil travailleur introuvable'; END IF;

  SELECT photo_url INTO profile_photo FROM profiles WHERE id = uid;

  IF (w.photo_url IS NULL OR trim(w.photo_url) = '') THEN
    IF profile_photo IS NOT NULL AND trim(profile_photo) <> '' THEN
      UPDATE workers SET photo_url = profile_photo WHERE id = w.id;
      w.photo_url := profile_photo;
    ELSE
      RAISE EXCEPTION 'Ajoutez une photo de profil avant de proposer un prix';
    END IF;
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

-- Clients voient leurs demandes
DROP POLICY IF EXISTS "requests_select_all_auth" ON requests;
DROP POLICY IF EXISTS "requests_select_auth" ON requests;
DROP POLICY IF EXISTS "requests_select_public" ON requests;
CREATE POLICY "requests_select_all_auth" ON requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "requests_insert_auth" ON requests;
DROP POLICY IF EXISTS "requests_insert_public" ON requests;
CREATE POLICY "requests_insert_auth" ON requests
  FOR INSERT TO authenticated WITH CHECK (true);

-- Client peut rattacher ses anciennes demandes
DROP POLICY IF EXISTS "requests_update_auth" ON requests;
CREATE POLICY "requests_update_auth" ON requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
