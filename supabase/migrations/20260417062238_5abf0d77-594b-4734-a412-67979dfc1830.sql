CREATE OR REPLACE FUNCTION public.advance_driver_step(driver_uuid uuid, new_status character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE drivers
    SET 
        status = new_status,
        current_step = CASE 
            -- New flow
            WHEN new_status = 'INTAKE_RECEIVED' THEN 1
            WHEN new_status = 'UNPAID' THEN 2
            WHEN new_status = 'PAYMENT_HOLD' THEN 2
            WHEN new_status = 'PAYMENT_COMPLETE' THEN 2
            WHEN new_status = 'SAP_REQUEST_PENDING' THEN 3
            WHEN new_status = 'SAP_REQUESTED' THEN 3
            WHEN new_status = 'SAP_PAPERWORK_PENDING' THEN 3
            WHEN new_status = 'SAP_PAPERWORK_RECEIVED' THEN 3
            WHEN new_status = 'ALCOHOL_FEE_PENDING' THEN 3
            WHEN new_status = 'CLEARINGHOUSE_AUTOMATING' THEN 4
            WHEN new_status = 'CLEARINGHOUSE_2FA_PENDING' THEN 4
            WHEN new_status = 'CLEARINGHOUSE_ACCEPTED' THEN 4
            WHEN new_status = 'CLEARINGHOUSE_FAILED' THEN 4
            -- Legacy designation aliases
            WHEN new_status = 'DESIGNATION_PENDING' THEN 4
            WHEN new_status = 'DESIGNATION_AUTOMATING' THEN 4
            WHEN new_status = 'DESIGNATION_COMPLETE' THEN 4
            WHEN new_status = 'DONOR_PASS_PENDING' THEN 5
            WHEN new_status = 'DONOR_PASS_SENT' THEN 5
            WHEN new_status = 'TEST_IN_PROGRESS' THEN 6
            WHEN new_status = 'RESULTS_PENDING' THEN 6
            WHEN new_status = 'RESULTS_RECEIVED' THEN 6
            WHEN new_status = 'RESULT_RECEIVED' THEN 6
            WHEN new_status = 'RTD_REPORT_FAILED' THEN 6
            WHEN new_status = 'COMPLETED' THEN 7
            WHEN new_status = 'RTD_COMPLETE' THEN 7
            -- Legacy intake
            WHEN new_status = 'INTAKE_PENDING' THEN 1
            ELSE current_step
        END,
        updated_at = NOW()
    WHERE id = driver_uuid;
END;
$function$;