import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Tenant {
  id: string;
  user_id: string | null;
  company_name: string;
  contact_email: string;
  crl_portal_url: string | null;
  crl_login_email: string | null;
  crl_password: string | null;
  crl_company_search_term: string | null;
  gmail_refresh_token: string | null;
  gmail_address: string | null;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_phone_number: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Tenant[];
    },
  });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: ['tenant', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants' as any)
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as Tenant;
    },
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { company_name: string; contact_email: string }) => {
      const { data, error } = await supabase
        .from('tenants' as any)
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Student added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Tenant> & { id: string }) => {
      const { data, error } = await supabase
        .from('tenants' as any)
        .update(values)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Tenant;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tenants' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Student removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/** Mask a credential string to show only last 4 chars */
export function maskCredential(value: string | null): string {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return '••••••••' + value.slice(-4);
}
