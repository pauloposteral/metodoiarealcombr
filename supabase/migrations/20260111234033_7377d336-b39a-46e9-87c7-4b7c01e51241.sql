-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload carousel images
CREATE POLICY "Users can upload carousel images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'carousel-images');

-- Allow anyone to view carousel images (public bucket)
CREATE POLICY "Anyone can view carousel images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'carousel-images');

-- Allow users to update their own carousel images
CREATE POLICY "Users can update own carousel images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'carousel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own carousel images
CREATE POLICY "Users can delete own carousel images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'carousel-images' AND auth.uid()::text = (storage.foldername(name))[1]);