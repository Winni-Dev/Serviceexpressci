-- ============================================================
-- SERVICE EXPRESS CI — Migration Clients / Partenaires / Devis
-- Exécutez TOUT ce fichier dans Supabase → SQL Editor → Run
-- (après votre SETUP existant)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES — nom, téléphone, nouveaux rôles
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'zone_manager', 'accountant', 'client', 'partner', 'worker'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON profiles (phone) WHERE phone IS NOT NULL AND phone <> '';

-- ────────────────────────────────────────────────────────────
-- 2. WORKERS — lien compte + partenaire + multi-zones
-- ────────────────────────────────────────────────────────────
ALTER TABLE workers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS worker_zones (
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  PRIMARY KEY (worker_id, zone_id)
);

-- Migrer zone_id existante vers worker_zones
INSERT INTO worker_zones (worker_id, zone_id)
SELECT id, zone_id FROM workers WHERE zone_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. REQUESTS — client lié + prix
-- ────────────────────────────────────────────────────────────
ALTER TABLE requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE requests ADD CONSTRAINT requests_status_check
  CHECK (status IN ('new', 'assigned', 'in_progress', 'done', 'cancelled'));

-- ────────────────────────────────────────────────────────────
-- 4. DEMANDES DE PARTENARIAT
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  experience TEXT NOT NULL,
  services_offered TEXT NOT NULL,
  zones_interest TEXT NOT NULL,
  why_partner TEXT NOT NULL,
  has_tools BOOLEAN DEFAULT false,
  has_transport BOOLEAN DEFAULT false,
  id_recto_url TEXT NOT NULL,
  id_verso_url TEXT NOT NULL,
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS partner_applications_one_pending
  ON partner_applications (user_id) WHERE status = 'pending';

-- ────────────────────────────────────────────────────────────
-- 5. PARTENAIRES (remplace le modèle « 1 chef = 1 zone »)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 6. INVITATIONS TRAVAILLEURS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS worker_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES services(id),
  zone_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  invitee_user_id UUID REFERENCES auth.users(id),
  worker_id UUID REFERENCES workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 7. PROPOSITIONS / DEVIS TRAVAILLEURS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (request_id, worker_id)
);

-- ────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS IN-APP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 9. HELPERS
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_phone(p TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(COALESCE(p, ''), '[^0-9]', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
  SELECT zone_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ────────────────────────────────────────────────────────────
-- 10. INSCRIPTION CLIENT (nom + téléphone + zone)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.register_client(
  p_name TEXT,
  p_phone TEXT,
  p_zone_id UUID
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  phone_norm TEXT := public.normalize_phone(p_phone);
  result profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  IF length(phone_norm) < 8 THEN RAISE EXCEPTION 'Numéro de téléphone invalide'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN RAISE EXCEPTION 'Nom invalide'; END IF;
  IF p_zone_id IS NULL THEN RAISE EXCEPTION 'Zone requise'; END IF;

  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE public.normalize_phone(phone) = phone_norm AND id <> uid
  ) THEN
    RAISE EXCEPTION 'Ce numéro est déjà utilisé';
  END IF;

  INSERT INTO profiles (id, email, name, phone, role, zone_id)
  VALUES (
    uid,
    COALESCE((SELECT email FROM auth.users WHERE id = uid), phone_norm || '@phone.serviceexpress.ci'),
    trim(p_name),
    phone_norm,
    'client',
    p_zone_id
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    zone_id = EXCLUDED.zone_id,
    email = COALESCE(profiles.email, EXCLUDED.email),
    role = CASE
      WHEN profiles.role IN ('super_admin', 'accountant', 'partner', 'worker', 'zone_manager')
        THEN profiles.role
      ELSE 'client'
    END
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_client(TEXT, TEXT, UUID) TO authenticated;

-- Connexion client : vérifie nom + téléphone, retourne l'email synthétique
CREATE OR REPLACE FUNCTION public.resolve_client_login(p_name TEXT, p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  phone_norm TEXT := public.normalize_phone(p_phone);
  u_email TEXT;
  u_name TEXT;
BEGIN
  SELECT email, name INTO u_email, u_name
  FROM profiles
  WHERE public.normalize_phone(phone) = phone_norm
    AND role IN ('client', 'partner', 'worker')
  LIMIT 1;

  IF u_email IS NULL THEN
    RAISE EXCEPTION 'Aucun compte trouvé avec ce numéro';
  END IF;

  IF lower(trim(u_name)) <> lower(trim(p_name)) THEN
    RAISE EXCEPTION 'Le nom ne correspond pas à ce numéro';
  END IF;

  RETURN u_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_client_login(TEXT, TEXT) TO anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- 11. ensure_user_profile mis à jour
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
  ELSIF u_meta->>'role' IN ('super_admin', 'zone_manager', 'accountant', 'client', 'partner', 'worker') THEN
    assigned_role := u_meta->>'role';
  ELSE
    assigned_role := 'client';
  END IF;

  INSERT INTO profiles (id, email, role, zone_id, name, phone)
  VALUES (
    uid,
    u_email,
    assigned_role,
    NULLIF(u_meta->>'zone_id', '')::uuid,
    NULLIF(u_meta->>'name', ''),
    public.normalize_phone(NULLIF(u_meta->>'phone', ''))
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, zone_id, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NULLIF(NEW.raw_user_meta_data->>'zone_id', '')::uuid,
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    public.normalize_phone(NULLIF(NEW.raw_user_meta_data->>'phone', ''))
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
-- 12. Candidature partenaire
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_partner_application(
  p_name TEXT,
  p_phone TEXT,
  p_experience TEXT,
  p_services_offered TEXT,
  p_zones_interest TEXT,
  p_why_partner TEXT,
  p_has_tools BOOLEAN,
  p_has_transport BOOLEAN,
  p_id_recto_url TEXT,
  p_id_verso_url TEXT,
  p_selfie_url TEXT
)
RETURNS partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  my_role TEXT;
  result partner_applications%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  my_role := public.get_my_role();
  IF my_role IN ('partner', 'super_admin') THEN
    RAISE EXCEPTION 'Vous êtes déjà partenaire ou admin';
  END IF;
  IF EXISTS (SELECT 1 FROM partner_applications WHERE user_id = uid AND status = 'pending') THEN
    RAISE EXCEPTION 'Vous avez déjà une demande en cours';
  END IF;

  INSERT INTO partner_applications (
    user_id, name, phone, experience, services_offered, zones_interest,
    why_partner, has_tools, has_transport, id_recto_url, id_verso_url, selfie_url
  ) VALUES (
    uid, p_name, public.normalize_phone(p_phone), p_experience, p_services_offered,
    p_zones_interest, p_why_partner, p_has_tools, p_has_transport, p_id_recto_url, p_id_verso_url, p_selfie_url
  ) RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_partner_application(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT
) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_partner_application(
  p_application_id UUID,
  p_approve BOOLEAN,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS partner_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app partner_applications%ROWTYPE;
  result partner_applications%ROWTYPE;
BEGIN
  IF public.get_my_role() IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  SELECT * INTO app FROM partner_applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Demande introuvable'; END IF;
  IF app.status <> 'pending' THEN RAISE EXCEPTION 'Demande déjà traitée'; END IF;

  UPDATE partner_applications SET
    status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
    admin_note = p_admin_note,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_application_id
  RETURNING * INTO result;

  IF p_approve THEN
    UPDATE profiles SET role = 'partner', name = COALESCE(name, app.name), phone = COALESCE(phone, app.phone)
    WHERE id = app.user_id;

    INSERT INTO partners (user_id, name, phone)
    VALUES (app.user_id, app.name, app.phone)
    ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, status = 'active';

    INSERT INTO notifications (user_id, title, body, type, link)
    VALUES (
      app.user_id,
      'Demande partenaire acceptée',
      'Félicitations ! Votre compte partenaire est activé.',
      'partner_approved',
      '/partenaire'
    );
  ELSE
    INSERT INTO notifications (user_id, title, body, type, link)
    VALUES (
      app.user_id,
      'Demande partenaire refusée',
      COALESCE(p_admin_note, 'Votre demande de partenariat n''a pas été acceptée.'),
      'partner_rejected',
      '/espace'
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_partner_application(UUID, BOOLEAN, TEXT) TO authenticated;

-- ────────────────────────────────────────────────────────────
-- 13. Invitation travailleur par téléphone
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.invite_worker(
  p_phone TEXT,
  p_service_id UUID,
  p_zone_ids UUID[]
)
RETURNS worker_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  phone_norm TEXT := public.normalize_phone(p_phone);
  invitee UUID;
  result worker_invitations%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  IF public.get_my_role() NOT IN ('partner', 'super_admin', 'zone_manager') THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  IF p_zone_ids IS NULL OR array_length(p_zone_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Sélectionnez au moins une zone';
  END IF;

  SELECT id INTO invitee FROM profiles
  WHERE public.normalize_phone(phone) = phone_norm
  LIMIT 1;

  INSERT INTO worker_invitations (partner_user_id, phone, service_id, zone_ids, invitee_user_id)
  VALUES (uid, phone_norm, p_service_id, p_zone_ids, invitee)
  RETURNING * INTO result;

  IF invitee IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, link, meta)
    VALUES (
      invitee,
      'Invitation travailleur',
      'Un partenaire souhaite vous ajouter comme travailleur. Acceptez ou refusez depuis votre espace.',
      'worker_invite',
      '/espace/invitations',
      jsonb_build_object('invitation_id', result.id)
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_worker(TEXT, UUID, UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_worker_invitation(
  p_invitation_id UUID,
  p_accept BOOLEAN
)
RETURNS worker_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  inv worker_invitations%ROWTYPE;
  prof profiles%ROWTYPE;
  new_worker_id UUID;
  z UUID;
  result worker_invitations%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT * INTO inv FROM worker_invitations WHERE id = p_invitation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation introuvable'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'Invitation déjà traitée'; END IF;

  SELECT * INTO prof FROM profiles WHERE id = uid;
  IF public.normalize_phone(prof.phone) IS DISTINCT FROM inv.phone
     AND inv.invitee_user_id IS DISTINCT FROM uid THEN
    RAISE EXCEPTION 'Cette invitation ne vous est pas destinée';
  END IF;

  IF NOT p_accept THEN
    UPDATE worker_invitations SET status = 'rejected', invitee_user_id = uid
    WHERE id = p_invitation_id RETURNING * INTO result;
    RETURN result;
  END IF;

  INSERT INTO workers (name, phone, service_id, zone_id, gender, status, user_id, partner_id, created_by)
  VALUES (
    COALESCE(prof.name, 'Travailleur'),
    inv.phone,
    inv.service_id,
    inv.zone_ids[1],
    'male',
    'active',
    uid,
    inv.partner_user_id,
    inv.partner_user_id
  )
  RETURNING id INTO new_worker_id;

  FOREACH z IN ARRAY inv.zone_ids LOOP
    INSERT INTO worker_zones (worker_id, zone_id) VALUES (new_worker_id, z)
    ON CONFLICT DO NOTHING;
  END LOOP;

  IF prof.role NOT IN ('super_admin', 'accountant', 'partner', 'zone_manager') THEN
    UPDATE profiles SET role = 'worker' WHERE id = uid;
  END IF;

  UPDATE worker_invitations
  SET status = 'accepted', invitee_user_id = uid, worker_id = new_worker_id
  WHERE id = p_invitation_id
  RETURNING * INTO result;

  INSERT INTO notifications (user_id, title, body, type, link)
  VALUES (
    inv.partner_user_id,
    'Invitation acceptée',
    COALESCE(prof.name, 'Un utilisateur') || ' a accepté de rejoindre votre équipe.',
    'worker_invite_accepted',
    '/partenaire/travailleurs'
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_worker_invitation(UUID, BOOLEAN) TO authenticated;

-- ────────────────────────────────────────────────────────────
-- 14. Devis : créer / choisir
-- ────────────────────────────────────────────────────────────
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
      w.name || ' propose ' || p_amount::text || ' FCFA pour votre demande.',
      'new_proposal',
      '/espace',
      jsonb_build_object('request_id', p_request_id, 'proposal_id', result.id)
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_proposal(UUID, DECIMAL, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_proposal(p_proposal_id UUID)
RETURNS requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  prop request_proposals%ROWTYPE;
  req requests%ROWTYPE;
  result requests%ROWTYPE;
  other_worker UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

  SELECT * INTO prop FROM request_proposals WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposition introuvable'; END IF;

  SELECT * INTO req FROM requests WHERE id = prop.request_id FOR UPDATE;
  IF req.client_id IS DISTINCT FROM uid AND public.get_my_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  IF req.status <> 'new' THEN RAISE EXCEPTION 'Demande déjà assignée'; END IF;

  UPDATE request_proposals SET status = 'accepted' WHERE id = p_proposal_id;
  UPDATE request_proposals SET status = 'rejected'
  WHERE request_id = prop.request_id AND id <> p_proposal_id AND status = 'pending';

  UPDATE requests SET
    status = 'assigned',
    worker_id = prop.worker_id,
    price = prop.amount
  WHERE id = prop.request_id
  RETURNING * INTO result;

  -- Notifier le travailleur choisi
  SELECT user_id INTO other_worker FROM workers WHERE id = prop.worker_id;
  IF other_worker IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, link)
    VALUES (other_worker, 'Mission acceptée', 'Le client a choisi votre proposition.', 'proposal_accepted', '/travailleur');
  END IF;

  -- Notifier les autres travailleurs ayant proposé
  INSERT INTO notifications (user_id, title, body, type, link)
  SELECT w.user_id, 'Proposition non retenue', 'Le client a choisi un autre professionnel.', 'proposal_rejected', '/travailleur'
  FROM request_proposals rp
  JOIN workers w ON w.id = rp.worker_id
  WHERE rp.request_id = prop.request_id
    AND rp.id <> p_proposal_id
    AND w.user_id IS NOT NULL;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_my_request(p_request_id UUID)
RETURNS requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  req requests%ROWTYPE;
  result requests%ROWTYPE;
  w_user UUID;
BEGIN
  SELECT * INTO req FROM requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Demande introuvable'; END IF;
  IF req.client_id IS DISTINCT FROM uid AND public.get_my_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  IF req.status IN ('done', 'cancelled') THEN
    RAISE EXCEPTION 'Impossible d''annuler cette demande';
  END IF;

  UPDATE requests SET status = 'cancelled' WHERE id = p_request_id RETURNING * INTO result;

  IF req.worker_id IS NOT NULL THEN
    SELECT user_id INTO w_user FROM workers WHERE id = req.worker_id;
    IF w_user IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type, link)
      VALUES (w_user, 'Mission annulée', 'Le client a annulé la demande.', 'request_cancelled', '/travailleur');
    END IF;
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_my_request(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.worker_update_request_status(
  p_request_id UUID,
  p_status TEXT
)
RETURNS requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  w_id UUID;
  req requests%ROWTYPE;
  result requests%ROWTYPE;
BEGIN
  IF p_status NOT IN ('in_progress', 'done') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;

  SELECT id INTO w_id FROM workers WHERE user_id = uid LIMIT 1;
  IF w_id IS NULL THEN RAISE EXCEPTION 'Travailleur introuvable'; END IF;

  SELECT * INTO req FROM requests WHERE id = p_request_id FOR UPDATE;
  IF req.worker_id IS DISTINCT FROM w_id AND public.get_my_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  UPDATE requests SET status = p_status WHERE id = p_request_id RETURNING * INTO result;

  IF req.client_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, link)
    VALUES (
      req.client_id,
      CASE WHEN p_status = 'done' THEN 'Travail terminé' ELSE 'Travail en cours' END,
      CASE WHEN p_status = 'done'
        THEN 'Le professionnel a marqué votre demande comme terminée.'
        ELSE 'Le professionnel a commencé votre intervention.'
      END,
      'request_status',
      '/espace'
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.worker_update_request_status(UUID, TEXT) TO authenticated;

-- create_staff_profile accepte les nouveaux rôles
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

  IF p_role NOT IN ('super_admin', 'zone_manager', 'accountant', 'partner', 'worker', 'client') THEN
    RAISE EXCEPTION 'Rôle invalide';
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

-- ────────────────────────────────────────────────────────────
-- 15. RLS
-- ────────────────────────────────────────────────────────────
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partner_apps_own" ON partner_applications;
CREATE POLICY "partner_apps_own" ON partner_applications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "partner_apps_insert" ON partner_applications;
CREATE POLICY "partner_apps_insert" ON partner_applications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "partners_select" ON partners;
CREATE POLICY "partners_select" ON partners
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "partners_all_admin" ON partners;
CREATE POLICY "partners_all_admin" ON partners
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin' OR user_id = auth.uid())
  WITH CHECK (public.get_my_role() = 'super_admin' OR user_id = auth.uid());

DROP POLICY IF EXISTS "worker_invites_select" ON worker_invitations;
CREATE POLICY "worker_invites_select" ON worker_invitations
  FOR SELECT TO authenticated
  USING (
    partner_user_id = auth.uid()
    OR invitee_user_id = auth.uid()
    OR phone = (SELECT phone FROM profiles WHERE id = auth.uid())
    OR public.get_my_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "worker_invites_insert" ON worker_invitations;
CREATE POLICY "worker_invites_insert" ON worker_invitations
  FOR INSERT TO authenticated WITH CHECK (partner_user_id = auth.uid());

DROP POLICY IF EXISTS "proposals_select" ON request_proposals;
CREATE POLICY "proposals_select" ON request_proposals
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "proposals_insert" ON request_proposals;
CREATE POLICY "proposals_insert" ON request_proposals
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "proposals_update" ON request_proposals;
CREATE POLICY "proposals_update" ON request_proposals
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "worker_zones_all" ON worker_zones;
CREATE POLICY "worker_zones_all" ON worker_zones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Requests : clients voient les leurs ; insert auth
DROP POLICY IF EXISTS "requests_insert_public" ON requests;
DROP POLICY IF EXISTS "requests_insert_auth" ON requests;
CREATE POLICY "requests_insert_auth" ON requests
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "requests_select_auth" ON requests;
DROP POLICY IF EXISTS "requests_select_public" ON requests;
DROP POLICY IF EXISTS "requests_select_all_auth" ON requests;
CREATE POLICY "requests_select_all_auth" ON requests
  FOR SELECT TO authenticated USING (true);

-- Profiles : lecture téléphone pour invitations (limité)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "profiles_select_staff" ON profiles
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('partner', 'zone_manager', 'worker', 'accountant'));

-- ────────────────────────────────────────────────────────────
-- 16. Storage pièces d'identité
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-docs', 'id-docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "id_docs_auth" ON storage.objects;
CREATE POLICY "id_docs_auth" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'id-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'id-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "id_docs_admin_read" ON storage.objects;
CREATE POLICY "id_docs_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'id-docs' AND public.get_my_role() = 'super_admin');

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- ✅ Terminé
-- Ensuite : déconnectez-vous / reconnectez-vous sur l'app
