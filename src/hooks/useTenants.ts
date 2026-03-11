import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  crl_portal_url: string | null;
  crl_login_email: string | null;
  crl_password: string | null;
  crl_company_search_term: string | null;
  gmail_address: string | null;
  gmail_refresh_token: string | null;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_phone_number: string | null;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateTenantData = {
  company_name: string;
  contact_email: string;
  contact_phone?: string | null;
};

export type UpdateTenantData = Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>;

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      return data as Tenant[];
    },
    refetchInterval: 30000,
  });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      if (!id) throw new Error('Tenant ID required');
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!id,
  });
}

export function useTenantDrivers(tenantId: string | null) {
  return useQuery({
    queryKey: ['tenant-drivers', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID required');
      const { data, error } = await supabase
        .from('drivers')
        .select('id, first_name, last_name, email, phone, current_step, status, payment_status, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantData) => {
      const { data: newTenant, error } = await supabase
        .from('tenants')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return newTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, updates }: { tenantId: string; updates: UpdateTenantData }) => {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
    },
  });
}
