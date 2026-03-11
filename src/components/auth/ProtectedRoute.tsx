import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isStudent, tenantId, role } = useAuth();
  const location = useLocation();

  // Check tenant status for students (active + setup completion)
  const { data: tenantStatus, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant-setup-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('tenants')
        .select('is_active, crl_login_email, gmail_refresh_token, twilio_account_sid')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && (role === 'student' || role === 'staff'),
  });

  const isCheckingTenant = (role === 'student' || role === 'staff') && tenantLoading;

  if (isLoading || isCheckingTenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Inactive tenant → pending approval
  if (tenantStatus && !tenantStatus.is_active) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Student with incomplete setup → wizard (unless already on wizard route)
  if (isStudent && tenantStatus && location.pathname !== '/setup') {
    const setupComplete =
      !!tenantStatus.crl_login_email &&
      !!tenantStatus.gmail_refresh_token &&
      !!tenantStatus.twilio_account_sid;
    if (!setupComplete) {
      return <Navigate to="/setup" replace />;
    }
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
