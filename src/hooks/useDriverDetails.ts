import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  driver_id: string;
  amount: number;
  payment_type: string;
  status: string;
  payment_method_type: string | null;
  initiated_at: string | null;
  completed_at: string | null;
  failure_reason: string | null;
  receipt_url: string | null;
}

export interface Document {
  id: string;
  driver_id: string;
  document_type: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  storage_path: string;
  description: string | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
}

export interface AuditEntry {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  changed_fields: string[] | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string | null;
}

export function useDriverPayments(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-payments', driverId],
    queryFn: async () => {
      if (!driverId) throw new Error('Driver ID is required');

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('driver_id', driverId)
        .order('initiated_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!driverId,
  });
}

export function useDriverDocuments(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-documents', driverId],
    queryFn: async () => {
      if (!driverId) throw new Error('Driver ID is required');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!driverId,
  });
}

export function useDriverActivity(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-activity', driverId],
    queryFn: async () => {
      if (!driverId) throw new Error('Driver ID is required');

      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('record_id', driverId)
        .eq('table_name', 'drivers')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!driverId,
  });
}

export function useAdvanceDriverStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, newStep, newStatus }: { 
      driverId: string; 
      newStep: number; 
      newStatus: string;
    }) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({ 
          current_step: newStep, 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, updates }: { 
      driverId: string; 
      updates: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-by-step'] });
    },
  });
}
