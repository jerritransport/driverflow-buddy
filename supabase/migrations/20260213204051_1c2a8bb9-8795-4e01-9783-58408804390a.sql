
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS employer_contact_name varchar;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS employer_job_title varchar;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS employer_phone varchar;

-- Migrate existing data
UPDATE public.drivers SET employer_contact_name = employer_contact WHERE employer_contact IS NOT NULL AND employer_contact_name IS NULL;
