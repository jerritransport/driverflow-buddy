import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTenant, Tenant } from '@/hooks/useTenants';
import { supabase } from '@/integrations/supabase/client';
import { isValidUSPhone, normalizeUSPhone, formatPhoneFinal } from '@/lib/phoneUtils';
import { MessageSquare, Loader2, Send, Save, Eye, EyeOff } from 'lucide-react';

interface TwilioConfigCardProps {
  tenant: Tenant;
}

function maskValue(value: string | null): string {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return '••••••••' + value.slice(-4);
}

export function TwilioConfigCard({ tenant }: TwilioConfigCardProps) {
  const { toast } = useToast();
  const updateTenant = useUpdateTenant();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const isConfigured = !!tenant.twilio_account_sid;

  useEffect(() => {
    if (isEditing) {
      setAccountSid(tenant.twilio_account_sid || '');
      setAuthToken(tenant.twilio_auth_token || '');
      setPhoneNumber(tenant.twilio_phone_number || '');
      setShowToken(false);
    }
  }, [isEditing, tenant]);

  const handleSave = async () => {
    if (!accountSid.trim()) {
      toast({ title: 'Validation Error', description: 'Account SID is required.', variant: 'destructive' });
      return;
    }
    if (!authToken.trim()) {
      toast({ title: 'Validation Error', description: 'Auth Token is required.', variant: 'destructive' });
      return;
    }
    if (!phoneNumber.trim() || !isValidUSPhone(phoneNumber)) {
      toast({ title: 'Validation Error', description: 'Enter a valid US phone number for Twilio.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await updateTenant.mutateAsync({
        tenantId: tenant.id,
        updates: {
          twilio_account_sid: accountSid.trim(),
          twilio_auth_token: authToken.trim(),
          twilio_phone_number: normalizeUSPhone(phoneNumber),
        },
      });
      toast({ title: 'Twilio Saved', description: 'Twilio credentials have been updated.' });
      setIsEditing(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-twilio`,
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

      if (!resp.ok) {
        throw new Error(result.error || 'Test failed');
      }

      toast({ title: 'Test SMS Sent', description: result.message });
    } catch (err: any) {
      toast({ title: 'Test Failed', description: err.message || 'Could not send test SMS.', variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" /> Twilio
          </CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              {isConfigured ? 'Edit' : 'Configure'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="twilio-sid">Account SID</Label>
              <Input
                id="twilio-sid"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-token">Auth Token</Label>
              <div className="relative">
                <Input
                  id="twilio-token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-phone">Phone Number</Label>
              <Input
                id="twilio-phone"
                placeholder="+1 (555) 010-3456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => {
                  if (phoneNumber) setPhoneNumber(formatPhoneFinal(phoneNumber));
                }}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {isConfigured ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Configured</Badge>
              ) : (
                <Badge variant="secondary">Not Configured</Badge>
              )}
            </div>
            {isConfigured && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account SID</span>
                  <span className="text-sm font-mono">{maskValue(tenant.twilio_account_sid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auth Token</span>
                  <span className="text-sm font-mono">{maskValue(tenant.twilio_auth_token)}</span>
                </div>
                {tenant.twilio_phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number</span>
                    <span className="text-sm">{tenant.twilio_phone_number}</span>
                  </div>
                )}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={handleTest}
                    disabled={isTesting}
                  >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Test Connection
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
