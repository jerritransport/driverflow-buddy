-- Grant SELECT permission on profiles table to authenticated role
GRANT SELECT ON public.profiles TO authenticated;

-- Grant SELECT permission on user_roles table to authenticated role
GRANT SELECT ON public.user_roles TO authenticated;

-- Grant UPDATE permission on profiles to authenticated (for self-updates)
GRANT UPDATE ON public.profiles TO authenticated;

-- Grant INSERT, UPDATE, DELETE on user_roles to authenticated (for admins via RLS)
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;