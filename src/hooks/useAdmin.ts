import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  last_active_at: string | null;
  role: 'admin' | 'staff';
}

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_fields: string[] | null;
  changed_by: string | null;
  changed_at: string | null;
  change_source: string | null;
  user_agent: string | null;
}

export function useUsersWithRoles() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          last_active_at: profile.last_active_at,
          role: (userRole?.role || 'staff') as 'admin' | 'staff',
        };
      });

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'staff' }) => {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      return { userId, newRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${data.newRole}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      full_name, 
      role 
    }: { 
      email: string; 
      password: string; 
      full_name: string; 
      role: 'admin' | 'staff';
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        'https://ntpaixfucjcxkntskcka.supabase.co/functions/v1/admin-create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email, password, full_name, role }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User Created',
        description: 'The new user has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        'https://ntpaixfucjcxkntskcka.supabase.co/functions/v1/admin-delete-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User Deleted',
        description: 'The user has been removed from the system.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAuditLogs(filters?: { table?: string; operation?: string; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_trail')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.table) {
        query = query.eq('table_name', filters.table);
      }

      if (filters?.operation) {
        query = query.eq('operation', filters.operation);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
}
