CREATE OR REPLACE FUNCTION public.fn_trigger_n8n_on_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_url  TEXT;
  v_body JSONB;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status

    WHEN 'SAP_REQUEST_PENDING' THEN
      v_url  := 'https://n8n.srv1186934.hstgr.cloud/webhook/trigger-sap-request';
      v_body := jsonb_build_object('driver_id', NEW.id);

    WHEN 'CLEARINGHOUSE_ACCEPTED' THEN
      v_url  := 'https://n8n.srv1186934.hstgr.cloud/webhook/trigger-donor-pass';
      v_body := jsonb_build_object('driver_id', NEW.id);

    WHEN 'NEGATIVE' THEN
      v_url  := 'https://n8n.srv1186934.hstgr.cloud/webhook/trigger-completion';
      v_body := jsonb_build_object('driver_id', NEW.id);

    ELSE
      RETURN NEW;

  END CASE;

  PERFORM net.http_post(
    url     := v_url,
    body    := v_body,
    headers := '{"Content-Type": "application/json"}'::JSONB
  );

  RETURN NEW;
END;
$function$;