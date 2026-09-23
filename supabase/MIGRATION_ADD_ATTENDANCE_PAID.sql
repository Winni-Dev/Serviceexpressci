-- Migration: add paid fields to attendance
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS paid_amount numeric NULL,
  ADD COLUMN IF NOT EXISTS paid_by uuid NULL;

-- Optionally add an index for paid queries
CREATE INDEX IF NOT EXISTS idx_attendance_paid ON attendance(paid);
