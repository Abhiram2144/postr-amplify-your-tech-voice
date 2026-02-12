
-- Create private storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false);

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own videos (needed for signed URLs)
CREATE POLICY "Users can read their own videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own videos (cleanup after processing)
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Service role can manage all video files (for edge function cleanup)
CREATE POLICY "Service role can manage videos"
ON storage.objects
FOR ALL
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');
