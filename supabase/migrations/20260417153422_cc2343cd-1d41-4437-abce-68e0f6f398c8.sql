CREATE POLICY "Authenticated users can read rtd-documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'rtd-documents');

CREATE POLICY "Authenticated users can upload rtd-documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rtd-documents');

CREATE POLICY "Authenticated users can update rtd-documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'rtd-documents');

CREATE POLICY "Authenticated users can delete rtd-documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'rtd-documents');