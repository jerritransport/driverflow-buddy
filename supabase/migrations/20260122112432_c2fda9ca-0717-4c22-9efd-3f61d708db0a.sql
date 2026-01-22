-- Grant SELECT on all views to authenticated users
GRANT SELECT ON public.dashboard_summary TO authenticated;
GRANT SELECT ON public.driver_full_details TO authenticated;
GRANT SELECT ON public.drivers_needing_attention TO authenticated;
GRANT SELECT ON public.recent_activity TO authenticated;
GRANT SELECT ON public.payment_summary TO authenticated;
GRANT SELECT ON public.clinic_performance TO authenticated;
GRANT SELECT ON public.sap_performance TO authenticated;
GRANT SELECT ON public.automation_performance TO authenticated;