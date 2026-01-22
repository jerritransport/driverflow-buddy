import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkUpdateData {
  status?: string;
  current_step?: number;
  payment_status?: string;
  payment_hold?: boolean;
}

export function useBulkUpdateDrivers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      driverIds, 
      updateData 
    }: { 
      driverIds: string[]; 
      updateData: BulkUpdateData;
    }) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .in('id', driverIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast({
        title: 'Drivers updated',
        description: `Successfully updated ${variables.driverIds.length} driver(s).`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
    },
  });
}
