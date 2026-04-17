-- ============================================================================
-- READY TO COPY: Storage Bucket Setup
-- Paste this entire SQL into Supabase Dashboard SQL Editor
-- This creates the seat-layouts bucket and RLS policies
-- ============================================================================

-- ============================================================================
-- 1. CREATE STORAGE BUCKET FOR SEAT LAYOUTS
-- ============================================================================

-- Insert bucket into storage.buckets table
INSERT INTO storage.buckets (id, name, owner, public, created_at, updated_at, file_size_limit, allowed_mime_types)
VALUES (
  'seat-layouts',
  'seat-layouts',
  NULL,
  true,
  now(),
  now(),
  52428800, -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  updated_at = now()
  WHERE storage.buckets.id = 'seat-layouts';

-- ============================================================================
-- 2. STORAGE RLS POLICIES FOR SEAT-LAYOUTS BUCKET
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to seat-layouts bucket
DROP POLICY IF EXISTS "Allow public read on seat-layouts" ON storage.objects;
CREATE POLICY "Allow public read on seat-layouts"
ON storage.objects FOR SELECT
USING (bucket_id = 'seat-layouts');

-- Policy 2: Allow authenticated users to upload seat layout images
DROP POLICY IF EXISTS "Allow authenticated upload to seat-layouts" ON storage.objects;
CREATE POLICY "Allow authenticated upload to seat-layouts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'seat-layouts' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update seat layout images
DROP POLICY IF EXISTS "Allow authenticated update on seat-layouts" ON storage.objects;
CREATE POLICY "Allow authenticated update on seat-layouts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'seat-layouts' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'seat-layouts' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete seat layout images
DROP POLICY IF EXISTS "Allow authenticated delete on seat-layouts" ON storage.objects;
CREATE POLICY "Allow authenticated delete on seat-layouts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'seat-layouts' 
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- VERIFY SUCCESS with these queries:
-- ============================================================================
-- SELECT id, name, public FROM storage.buckets WHERE id = 'seat-layouts';
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%seat-layouts%';
-- ============================================================================
