DROP POLICY IF EXISTS documents_insert_policy ON public.documents;
DROP POLICY IF EXISTS documents_select_policy ON public.documents;
DROP POLICY IF EXISTS documents_delete_policy ON public.documents;

CREATE POLICY "Authenticated can view documents"
ON public.documents FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert documents"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update documents"
ON public.documents FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete documents"
ON public.documents FOR DELETE TO authenticated
USING (true);