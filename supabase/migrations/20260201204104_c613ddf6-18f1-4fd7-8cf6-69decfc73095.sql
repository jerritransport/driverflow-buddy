-- Grant full CRUD permissions to authenticated users on the drivers table
GRANT ALL ON public.drivers TO authenticated;

-- Also ensure the sequences are usable
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select to anon for potential public read (optional)
GRANT SELECT ON public.drivers TO anon;