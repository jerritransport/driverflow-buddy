-- Grant permissions to authenticated users on the drivers table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;

-- Also grant to anon role for potential public read access (if needed)
GRANT SELECT ON public.drivers TO anon;