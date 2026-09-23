-- ============================================================
-- Catégories + images services
-- Supabase → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON service_categories;
CREATE POLICY "categories_select_all" ON service_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_write_auth" ON service_categories;
CREATE POLICY "categories_write_auth" ON service_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "service_images_public_read" ON storage.objects;
CREATE POLICY "service_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

DROP POLICY IF EXISTS "service_images_auth_write" ON storage.objects;
CREATE POLICY "service_images_auth_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'service-images')
  WITH CHECK (bucket_id = 'service-images');

GRANT ALL ON TABLE service_categories TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
