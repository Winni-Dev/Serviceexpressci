-- Suppléments / rajouts de prix sur une demande en cours
CREATE TABLE IF NOT EXISTS request_price_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  previous_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  extra_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  new_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS request_price_adjustments_request_idx
  ON request_price_adjustments (request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS request_price_adjustments_client_idx
  ON request_price_adjustments (client_id, status);

ALTER TABLE requests ADD COLUMN IF NOT EXISTS price_adjustment_note TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS last_adjustment_id UUID REFERENCES request_price_adjustments(id);

-- RLS (simple pour l'admin + propriétaire)
ALTER TABLE request_price_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "request_adjustments_select_own" ON request_price_adjustments;
CREATE POLICY "request_adjustments_select_own" ON request_price_adjustments
  FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR worker_id IN (SELECT id FROM workers WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'zone_manager', 'accountant')
    )
  );

DROP POLICY IF EXISTS "request_adjustments_insert_worker" ON request_price_adjustments;
CREATE POLICY "request_adjustments_insert_worker" ON request_price_adjustments
  FOR INSERT TO authenticated
  WITH CHECK (
    worker_id IN (SELECT id FROM workers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "request_adjustments_update_client" ON request_price_adjustments;
CREATE POLICY "request_adjustments_update_client" ON request_price_adjustments
  FOR UPDATE TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'zone_manager', 'accountant')
    )
  )
  WITH CHECK (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'zone_manager', 'accountant')
    )
  );
