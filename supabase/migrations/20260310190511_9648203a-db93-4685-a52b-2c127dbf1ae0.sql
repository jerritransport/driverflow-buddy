-- Revoke anon (unauthenticated) access from all PII tables
-- The anon role should never have direct access to sensitive data
REVOKE ALL ON public.drivers FROM anon;
REVOKE ALL ON public.saps FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.driver_notes FROM anon;
REVOKE ALL ON public.documents FROM anon;
REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.communications FROM anon;
REVOKE ALL ON public.audit_trail FROM anon;
REVOKE ALL ON public.intake_forms FROM anon;
REVOKE ALL ON public.automation_logs FROM anon;