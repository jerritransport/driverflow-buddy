import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  sap_counselor: string;
  how_heard: string | null;
  staff_member_id: string | null;
  status: 'OPEN' | 'CONVERTED';
  created_at: string;
}

export interface CreateLeadData {
  first_name: string;
  last_name: string;
  phone: string;
  sap_counselor: string;
  how_heard?: string | null;
  staff_member_id: string;
}

export function useOpenLeads(search?: string) {
  return useQuery({
    queryKey: ['leads', 'open', search],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
    refetchInterval: 30000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
