
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "saps_insert_policy" ON public.saps;
DROP POLICY IF EXISTS "saps_select_policy" ON public.saps;
DROP POLICY IF EXISTS "saps_update_policy" ON public.saps;

-- Recreate as PERMISSIVE policies
CREATE POLICY "saps_select_policy" ON public.saps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "saps_insert_policy" ON public.saps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "saps_update_policy" ON public.saps
  FOR UPDATE TO authenticated USING (true);
