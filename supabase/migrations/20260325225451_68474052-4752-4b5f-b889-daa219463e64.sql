-- Feature 3: Staff Members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff_members" ON public.staff_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage staff_members" ON public.staff_members
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_members TO authenticated;

-- Add staff_member_id to drivers
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS staff_member_id uuid REFERENCES public.staff_members(id);

-- Feature 5: Unmatched Payments table
CREATE TABLE IF NOT EXISTS public.unmatched_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_id text,
  payer_name text,
  payer_email text,
  amount numeric,
  payment_date timestamptz,
  matched_driver_id uuid REFERENCES public.drivers(id),
  matched_at timestamptz,
  matched_by uuid,
  status text NOT NULL DEFAULT 'unmatched',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unmatched_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view unmatched_payments" ON public.unmatched_payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert unmatched_payments" ON public.unmatched_payments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update unmatched_payments" ON public.unmatched_payments
  FOR UPDATE TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.unmatched_payments TO authenticated;

-- Feature 6: Rename Clearinghouse status values in drivers data
UPDATE public.drivers SET status = 'DESIGNATION_PENDING' WHERE status = 'CLEARINGHOUSE_PENDING';
UPDATE public.drivers SET status = 'DESIGNATION_AUTOMATING' WHERE status = 'CLEARINGHOUSE_AUTOMATING';
UPDATE public.drivers SET status = 'DESIGNATION_COMPLETE' WHERE status = 'CLEARINGHOUSE_COMPLETE';

-- Update the advance_driver_step function to use new status names
CREATE OR REPLACE FUNCTION public.advance_driver_step(driver_uuid uuid, new_status character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE drivers
    SET 
        status = new_status,
        current_step = CASE 
            WHEN new_status = 'INTAKE_PENDING' THEN 1
            WHEN new_status = 'PAYMENT_HOLD' THEN 2
            WHEN new_status = 'PAYMENT_COMPLETE' THEN 2
            WHEN new_status = 'SAP_REQUEST_PENDING' THEN 3
            WHEN new_status = 'SAP_PAPERWORK_PENDING' THEN 3
            WHEN new_status = 'SAP_PAPERWORK_RECEIVED' THEN 3
            WHEN new_status = 'ALCOHOL_FEE_PENDING' THEN 3
            WHEN new_status = 'DESIGNATION_PENDING' THEN 4
            WHEN new_status = 'DESIGNATION_AUTOMATING' THEN 4
            WHEN new_status = 'DESIGNATION_COMPLETE' THEN 4
            WHEN new_status = 'DONOR_PASS_PENDING' THEN 5
            WHEN new_status = 'DONOR_PASS_SENT' THEN 5
            WHEN new_status = 'TEST_IN_PROGRESS' THEN 6
            WHEN new_status = 'RESULTS_PENDING' THEN 6
            WHEN new_status = 'RESULTS_RECEIVED' THEN 6
            WHEN new_status = 'RESULT_RECEIVED' THEN 6
            WHEN new_status = 'RTD_COMPLETE' THEN 7
            ELSE current_step
        END,
        updated_at = NOW()
    WHERE id = driver_uuid;
END;
$function$;
