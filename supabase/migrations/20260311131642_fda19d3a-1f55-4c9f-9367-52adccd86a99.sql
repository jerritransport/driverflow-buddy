
-- Helper function: get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.tenants WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function: check if user is a student
CREATE OR REPLACE FUNCTION public.is_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'student'
  )
$$;

-- Update drivers RLS policies
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;

CREATE POLICY "admin_staff_select_drivers" ON public.drivers
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "admin_staff_insert_drivers" ON public.drivers
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "admin_staff_update_drivers" ON public.drivers
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "admin_staff_delete_drivers" ON public.drivers
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "student_select_drivers" ON public.drivers
FOR SELECT TO authenticated
USING (
  public.is_student(auth.uid()) AND tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "student_insert_drivers" ON public.drivers
FOR INSERT TO authenticated
WITH CHECK (
  public.is_student(auth.uid()) AND tenant_id = public.get_user_tenant_id(auth.uid())
);

CREATE POLICY "student_update_drivers" ON public.drivers
FOR UPDATE TO authenticated
USING (
  public.is_student(auth.uid()) AND tenant_id = public.get_user_tenant_id(auth.uid())
);
