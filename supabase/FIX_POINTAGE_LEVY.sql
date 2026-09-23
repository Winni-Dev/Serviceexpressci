-- ============================================================
-- Pointage automatique + prélèvement bénéfice
-- Supabase → SQL Editor → Run
-- ============================================================

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES requests(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS levy_amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS levied_at TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS levied_by UUID REFERENCES auth.users(id);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_request_unique
  ON attendance (request_id) WHERE request_id IS NOT NULL;

-- Terminer une mission → pointage auto (bénéfice 0 tant qu'aucun prélèvement)
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
  mission_price NUMERIC;
  svc_name TEXT;
BEGIN
  IF p_status NOT IN ('in_progress', 'done') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;

  SELECT id INTO w_id FROM workers WHERE user_id = uid LIMIT 1;
  IF w_id IS NULL AND public.get_my_role() = 'super_admin' THEN
    SELECT worker_id INTO w_id FROM requests WHERE id = p_request_id;
  END IF;
  IF w_id IS NULL THEN RAISE EXCEPTION 'Travailleur introuvable'; END IF;

  SELECT * INTO req FROM requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Demande introuvable'; END IF;
  IF req.worker_id IS DISTINCT FROM w_id AND public.get_my_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  UPDATE requests SET status = p_status WHERE id = p_request_id RETURNING * INTO result;

  IF p_status = 'done' THEN
    mission_price := COALESCE(req.price, 0);
    SELECT name INTO svc_name FROM services WHERE id = req.service_id;

    INSERT INTO attendance (
      worker_id, request_id, amount, total_received, levy_amount,
      description, client_name, date, created_by
    )
    VALUES (
      req.worker_id,
      p_request_id,
      mission_price,
      mission_price,
      0,
      'Mission terminée — ' || COALESCE(svc_name, 'Service') ||
        ' · Client: ' || COALESCE(req.name, 'N/A') ||
        ' · ' || COALESCE(req.quartier, ''),
      req.name,
      CURRENT_DATE,
      uid
    )
    ON CONFLICT (request_id) WHERE request_id IS NOT NULL DO NOTHING;
  END IF;

  IF req.client_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type, link)
    VALUES (
      req.client_id,
      CASE WHEN p_status = 'done' THEN 'Travail terminé' ELSE 'Travail en cours' END,
      CASE WHEN p_status = 'done'
        THEN 'Le professionnel a marqué votre demande comme terminée. Vous pouvez le noter.'
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

-- Prélèvement admin → réduit le perçu travailleur, crée le bénéfice
CREATE OR REPLACE FUNCTION public.apply_attendance_levy(
  p_attendance_id UUID,
  p_levy NUMERIC
)
RETURNS attendance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec attendance%ROWTYPE;
  result attendance%ROWTYPE;
  new_worker_share NUMERIC;
BEGIN
  IF public.get_my_role() NOT IN ('super_admin', 'accountant') THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  IF p_levy IS NULL OR p_levy < 0 THEN
    RAISE EXCEPTION 'Montant de prélèvement invalide';
  END IF;

  SELECT * INTO rec FROM attendance WHERE id = p_attendance_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pointage introuvable'; END IF;
  IF p_levy > rec.total_received THEN
    RAISE EXCEPTION 'Le prélèvement ne peut pas dépasser le reçu client';
  END IF;

  new_worker_share := rec.total_received - p_levy;

  UPDATE attendance SET
    amount = new_worker_share,
    levy_amount = p_levy,
    levied_at = NOW(),
    levied_by = auth.uid()
  WHERE id = p_attendance_id
  RETURNING * INTO result;

  INSERT INTO notifications (user_id, title, body, type, link)
  SELECT w.user_id,
    'Prélèvement effectué',
    'Un prélèvement de ' || p_levy::text || ' FCFA a été appliqué. Votre part est maintenant ' ||
      new_worker_share::text || ' FCFA.',
    'levy',
    '/travailleur'
  FROM workers w
  WHERE w.id = rec.worker_id AND w.user_id IS NOT NULL;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_attendance_levy(UUID, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
