import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function GmailCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const success = searchParams.get('gmail_success');
    const error = searchParams.get('gmail_error');
    const tenantId = searchParams.get('tenant_id');

    if (success === 'true') {
      toast({ title: 'Gmail Connected', description: 'Gmail OAuth has been successfully configured.' });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      }
    } else if (error) {
      toast({ title: 'Gmail Connection Failed', description: decodeURIComponent(error), variant: 'destructive' });
    }

    navigate('/students', { replace: true });
  }, [searchParams, navigate, toast, queryClient]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Processing Gmail connection...</p>
      </div>
    </div>
  );
}
