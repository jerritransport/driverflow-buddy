-- Grant INSERT permission on audit_trail to authenticated users (needed for triggers)
GRANT INSERT ON public.audit_trail TO authenticated;

-- Grant SELECT permission as well so users can view audit logs
GRANT SELECT ON public.audit_trail TO authenticated;