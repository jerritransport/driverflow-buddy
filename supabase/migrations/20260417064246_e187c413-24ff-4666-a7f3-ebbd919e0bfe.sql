DROP VIEW IF EXISTS public.driver_full_details;

ALTER TABLE public.drivers ALTER COLUMN cdl_state TYPE TEXT;
ALTER TABLE public.drivers ALTER COLUMN state TYPE TEXT;
ALTER TABLE public.drivers ALTER COLUMN zip_code TYPE TEXT;

CREATE VIEW public.driver_full_details AS
SELECT d.id,
    d.first_name,
    d.last_name,
    d.middle_name,
    d.date_of_birth,
    d.gender,
    d.email,
    d.phone,
    d.cdl_number,
    d.cdl_state,
    d.status,
    d.current_step,
    d.payment_status,
    d.amount_paid,
    d.amount_due,
    d.created_at,
    d.updated_at,
    s.id AS sap_id,
    s.first_name AS sap_first_name,
    s.last_name AS sap_last_name,
    s.email AS sap_email,
    s.phone AS sap_phone,
    s.organization AS sap_organization,
    c.id AS clinic_id,
    c.name AS clinic_name,
    c.address_line1 AS clinic_address,
    c.city AS clinic_city,
    c.state AS clinic_state,
    c.phone AS clinic_phone,
    d.donor_pass_number,
    d.test_scheduled_date,
    d.test_result,
    d.test_result_date,
    d.rtd_completed,
    d.rtd_completed_at,
    CASE
        WHEN d.rtd_completed = true THEN EXTRACT(epoch FROM d.rtd_completed_at - d.created_at) / 86400::numeric
        ELSE NULL::numeric
    END AS completion_days,
    (SELECT count(*) FROM documents WHERE documents.driver_id = d.id) AS document_count,
    (SELECT count(*) FROM communications WHERE communications.driver_id = d.id AND communications.type::text = 'email'::text) AS email_count,
    (SELECT count(*) FROM communications WHERE communications.driver_id = d.id AND communications.type::text = 'sms'::text) AS sms_count
FROM drivers d
LEFT JOIN saps s ON d.sap_id = s.id
LEFT JOIN clinics c ON d.test_clinic_id = c.id;