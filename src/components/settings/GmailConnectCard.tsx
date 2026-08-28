import { useState } from 'react';
import { useTenants } from '@/hooks/useTenants';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function GmailConnectCard() {
  const { data: tenants, isLoading } = useTenants();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (tenantId: string) => {
    setConnectingId(tenantId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth?action=initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            redirect_url: window.location.href,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.auth_url) {
        throw new Error(data.error || 'Failed to start Gmail connection');
      }
      window.location.href = data.auth_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect Gmail';
      toast.error(message);
      setConnectingId(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!tenants || tenants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" /> Gmail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No company record found to connect Gmail to.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4" /> Gmail — Driver Communications
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Connect the Gmail account that emails to drivers (Welcome, Donor Pass, SAP
          Follow-Up, etc.) will be sent from.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenants.map((tenant) => {
          const isConnected = !!tenant.gmail_refresh_token;
          return (
            <div key={tenant.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{tenant.company_name}</p>
                {isConnected && tenant.gmail_address && (
                  <p className="text-xs text-muted-foreground">{tenant.gmail_address}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge className="bg-[hsl(var(--status-success))] text-white">Connected</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={connectingId === tenant.id}
                    onClick={() => handleConnect(tenant.id)}
                  >
                    {connectingId === tenant.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    Connect Gmail
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
