
-- Add contact_phone to tenants table (missing column)
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone text;

-- Add tenant_id to drivers table (nullable so existing drivers still work)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Create index on drivers.tenant_id for performance
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_id ON public.drivers(tenant_id);

-- Grant authenticated role access to the new column
GRANT SELECT, INSERT, UPDATE ON public.drivers TO authenticated;
