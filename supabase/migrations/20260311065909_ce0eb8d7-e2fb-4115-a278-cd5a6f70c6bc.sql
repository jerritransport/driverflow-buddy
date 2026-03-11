
-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_email text NOT NULL,
  crl_portal_url text,
  crl_login_email text,
  crl_password text,
  crl_company_search_term text,
  gmail_refresh_token text,
  gmail_address text,
  twilio_account_sid text,
  twilio_auth_token text,
  twilio_phone_number text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all tenants"
  ON public.tenants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert tenants"
  ON public.tenants FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own tenant credentials"
  ON public.tenants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update any tenant"
  ON public.tenants FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tenants"
  ON public.tenants FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;

-- Updated_at trigger
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Audit trail trigger
CREATE TRIGGER tenants_audit_trail
  AFTER INSERT OR UPDATE OR DELETE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_audit_trail();
