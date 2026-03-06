
-- Grant INSERT, UPDATE permissions on saps table to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.saps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.saps TO anon;
