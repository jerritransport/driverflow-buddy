import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DriverNote {
  id: string;
  driver_id: string;
  user_id: string | null;
  note_text: string;
  created_at: string | null;
  user_email?: string;
}

export function useDriverNotes(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-notes', driverId],
    queryFn: async () => {
      if (!driverId) throw new Error('Driver ID is required');

      const { data, error } = await supabase
        .from('driver_notes')
        .select(`
          id,
          driver_id,
          user_id,
          note_text,
          created_at
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get user emails for notes
      const userIds = [...new Set(data.map(n => n.user_id).filter(Boolean))];
      let userEmails: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        
        if (profiles) {
          userEmails = profiles.reduce((acc, p) => {
            acc[p.id] = p.email;
            return acc;
          }, {} as Record<string, string>);
        }
      }
      
      return data.map(note => ({
        ...note,
        user_email: note.user_id ? userEmails[note.user_id] : undefined,
      })) as DriverNote[];
    },
    enabled: !!driverId,
  });
}

export function useAddDriverNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, noteText }: { driverId: string; noteText: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('driver_notes')
        .insert({
          driver_id: driverId,
          user_id: user?.id ?? null,
          note_text: noteText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-notes', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['driver-notes-count', variables.driverId] });
    },
  });
}

export function useDeleteDriverNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, driverId }: { noteId: string; driverId: string }) => {
      const { error } = await supabase
        .from('driver_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return { noteId, driverId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-notes', data.driverId] });
      queryClient.invalidateQueries({ queryKey: ['driver-notes-count', data.driverId] });
    },
  });
}

export function useDriverNotesCount(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-notes-count', driverId],
    queryFn: async () => {
      if (!driverId) return 0;

      const { count, error } = await supabase
        .from('driver_notes')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverId);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!driverId,
  });
}
