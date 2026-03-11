import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useTenant, useTenantDrivers, useUpdateTenant } from '@/hooks/useTenants';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Info, Users, Key, Pencil, Mail, Phone, MessageSquare, Globe, Loader2, Unplug } from 'lucide-react';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TwilioConfigCard } from './TwilioConfigCard';
import { CrlConfigCard } from './CrlConfigCard';

interface StudentDetailPanelProps {
  tenantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (tenantId: string) => void;
}

export function StudentDetailPanel({ tenantId, open, onOpenChange, onEdit }: StudentDetailPanelProps) {
  const { data: tenant, isLoading } = useTenant(tenantId);
  const { data: drivers, isLoading: driversLoading } = useTenantDrivers(tenantId);
  const updateTenant = useUpdateTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gmailLoading, setGmailLoading] = useState(false);

  if (!tenantId) return null;

  const handleConnectGmail = async () => {
    if (!tenant) return;
    setGmailLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/gmail/callback`;

      // Manually add action param since invoke doesn't support query params
      // We'll use fetch directly instead
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth?action=initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ tenant_id: tenant.id, redirect_url: redirectUrl }),
        }
      );

      const result = await resp.json();

      if (!resp.ok || !result.auth_url) {
        throw new Error(result.error || 'Failed to initiate OAuth');
      }

      // Redirect to Google consent screen
      window.location.href = result.auth_url;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to connect Gmail.', variant: 'destructive' });
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!tenant) return;
    setGmailLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth?action=disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ tenant_id: tenant.id }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to disconnect');

      toast({ title: 'Gmail Disconnected', description: 'Gmail OAuth credentials have been removed.' });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', tenant.id] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to disconnect Gmail.', variant: 'destructive' });
    } finally {
      setGmailLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!tenant) return;
    try {
      await updateTenant.mutateAsync({
        tenantId: tenant.id,
        updates: { is_active: !tenant.is_active },
      });
      toast({
        title: tenant.is_active ? 'Student Deactivated' : 'Student Activated',
        description: `${tenant.company_name} is now ${tenant.is_active ? 'inactive' : 'active'}.`,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const credentialStatus = (value: string | null) =>
    value ? (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Connected</Badge>
    ) : (
      <Badge variant="secondary">Not Configured</Badge>
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : tenant ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl truncate">{tenant.company_name}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{tenant.contact_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="outline" size="icon" onClick={() => onEdit(tenant.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="info" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info" className="gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="credentials" className="gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="drivers" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Drivers
                </TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="mt-4 space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Company Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <DetailRow icon={Building2} label="Company" value={tenant.company_name} />
                    <DetailRow icon={Mail} label="Email" value={tenant.contact_email} />
                    <DetailRow icon={Phone} label="Phone" value={tenant.contact_phone ? formatPhoneDisplay(tenant.contact_phone) : '—'} />
                    <DetailRow icon={Info} label="Created" value={format(new Date(tenant.created_at), 'MMM d, yyyy')} />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Active Status</p>
                      <p className="text-sm text-muted-foreground">Enable or disable this student tenant</p>
                    </div>
                    <Switch
                      checked={tenant.is_active}
                      onCheckedChange={handleToggleActive}
                      disabled={updateTenant.isPending}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Credentials Tab */}
              <TabsContent value="credentials" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" /> Gmail
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {credentialStatus(tenant.gmail_refresh_token)}
                    </div>
                    {tenant.gmail_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Address</span>
                        <span className="text-sm">{tenant.gmail_address}</span>
                      </div>
                    )}
                    <div className="pt-1">
                      {tenant.gmail_refresh_token ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={handleDisconnectGmail}
                          disabled={gmailLoading}
                        >
                          {gmailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                          Disconnect Gmail
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={handleConnectGmail}
                          disabled={gmailLoading}
                        >
                          {gmailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          Connect Gmail
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <TwilioConfigCard tenant={tenant} />

                <CrlConfigCard tenant={tenant} />
              </TabsContent>

              {/* Drivers Tab */}
              <TabsContent value="drivers" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Assigned Drivers ({drivers?.length ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {driversLoading ? (
                      <div className="space-y-2 p-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : !drivers?.length ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        No drivers assigned to this tenant yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Step</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drivers.map((driver) => (
                            <TableRow key={driver.id}>
                              <TableCell>
                                <p className="font-medium text-sm">{driver.first_name} {driver.last_name}</p>
                                <p className="text-xs text-muted-foreground">{driver.email}</p>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={driver.status} />
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium">{driver.current_step}/7</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Student not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
