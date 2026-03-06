
-- Safe phone normalization for drivers and saps tables
-- Only updates numbers that can be confidently identified as valid US numbers
-- Logs results via RAISE NOTICE

DO $$
DECLARE
  v_drivers_total INT := 0;
  v_drivers_updated INT := 0;
  v_drivers_skipped INT := 0;
  v_saps_total INT := 0;
  v_saps_updated INT := 0;
  v_saps_skipped INT := 0;
  v_digits TEXT;
  v_normalized TEXT;
  rec RECORD;
BEGIN
  -- === DRIVERS ===
  FOR rec IN SELECT id, phone FROM public.drivers WHERE phone IS NOT NULL AND phone != '' LOOP
    v_drivers_total := v_drivers_total + 1;
    v_digits := regexp_replace(rec.phone, '[^0-9]', '', 'g');
    
    -- Already valid E.164 US format
    IF rec.phone ~ '^\+1\d{10}$' THEN
      -- Already normalized, skip
      v_drivers_skipped := v_drivers_skipped + 1;
      RAISE NOTICE 'DRIVER SKIP [%]: "%" - already E.164', rec.id, rec.phone;
      CONTINUE;
    END IF;
    
    -- Exactly 10 digits -> +1XXXXXXXXXX
    IF length(v_digits) = 10 THEN
      v_normalized := '+1' || v_digits;
      UPDATE public.drivers SET phone = v_normalized WHERE id = rec.id;
      v_drivers_updated := v_drivers_updated + 1;
      RAISE NOTICE 'DRIVER UPDATE [%]: "%" -> "%"', rec.id, rec.phone, v_normalized;
      CONTINUE;
    END IF;
    
    -- Exactly 11 digits starting with 1 -> +1XXXXXXXXXX
    IF length(v_digits) = 11 AND v_digits LIKE '1%' THEN
      v_normalized := '+' || v_digits;
      UPDATE public.drivers SET phone = v_normalized WHERE id = rec.id;
      v_drivers_updated := v_drivers_updated + 1;
      RAISE NOTICE 'DRIVER UPDATE [%]: "%" -> "%"', rec.id, rec.phone, v_normalized;
      CONTINUE;
    END IF;
    
    -- Ambiguous / invalid - do NOT modify
    v_drivers_skipped := v_drivers_skipped + 1;
    RAISE NOTICE 'DRIVER SKIP [%]: "%" - ambiguous (% digits)', rec.id, rec.phone, length(v_digits);
  END LOOP;
  
  RAISE NOTICE '--- DRIVERS SUMMARY: total=%, updated=%, skipped=% ---', v_drivers_total, v_drivers_updated, v_drivers_skipped;

  -- === SAPS ===
  FOR rec IN SELECT id, phone FROM public.saps WHERE phone IS NOT NULL AND phone != '' LOOP
    v_saps_total := v_saps_total + 1;
    v_digits := regexp_replace(rec.phone, '[^0-9]', '', 'g');
    
    IF rec.phone ~ '^\+1\d{10}$' THEN
      v_saps_skipped := v_saps_skipped + 1;
      RAISE NOTICE 'SAP SKIP [%]: "%" - already E.164', rec.id, rec.phone;
      CONTINUE;
    END IF;
    
    IF length(v_digits) = 10 THEN
      v_normalized := '+1' || v_digits;
      UPDATE public.saps SET phone = v_normalized WHERE id = rec.id;
      v_saps_updated := v_saps_updated + 1;
      RAISE NOTICE 'SAP UPDATE [%]: "%" -> "%"', rec.id, rec.phone, v_normalized;
      CONTINUE;
    END IF;
    
    IF length(v_digits) = 11 AND v_digits LIKE '1%' THEN
      v_normalized := '+' || v_digits;
      UPDATE public.saps SET phone = v_normalized WHERE id = rec.id;
      v_saps_updated := v_saps_updated + 1;
      RAISE NOTICE 'SAP UPDATE [%]: "%" -> "%"', rec.id, rec.phone, v_normalized;
      CONTINUE;
    END IF;
    
    v_saps_skipped := v_saps_skipped + 1;
    RAISE NOTICE 'SAP SKIP [%]: "%" - ambiguous (% digits)', rec.id, rec.phone, length(v_digits);
  END LOOP;
  
  RAISE NOTICE '--- SAPS SUMMARY: total=%, updated=%, skipped=% ---', v_saps_total, v_saps_updated, v_saps_skipped;
  RAISE NOTICE '=== PHONE NORMALIZATION COMPLETE ===';
END $$;
