import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, Globe, CheckCircle2, XCircle, Save } from 'lucide-react';
import { useUpdateTenant, maskCredential, type Tenant } from '@/hooks/useTenants';
import { toast } from 'sonner';

interface Props {
  tenant: Tenant;
}

// ─── Gmail Section ───
function GmailSection({ tenant }: Props) {
  const connected = !!tenant.gmail_address;

  const handleConnect = () => {
    toast.info('Google OAuth integration requires configuring OAuth Client ID/Secret. Contact your administrator.');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Gmail Connection</CardTitle>
          </div>
          <Badge variant={connected ? 'default' : 'secondary'} className={connected ? 'bg-[hsl(var(--status-success))] text-white' : ''}>
            {connected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        <CardDescription>
          Connect a Gmail account to send automated emails on behalf of this student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-success))]" />
            <span className="font-medium">{tenant.gmail_address}</span>
          </div>
        ) : (
          <Button onClick={handleConnect} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Connect Gmail
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Twilio Section ───
function TwilioSection({ tenant }: Props) {
  const updateTenant = useUpdateTenant();
  const [editing, setEditing] = useState(false);
  const [sid, setSid] = useState('');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState(tenant.twilio_phone_number || '');

  const configured = !!tenant.twilio_account_sid;

  const handleSave = async () => {
    if (!sid.trim() || !token.trim() || !phone.trim()) {
      toast.error('All Twilio fields are required');
      return;
    }
    await updateTenant.mutateAsync({
      id: tenant.id,
      twilio_account_sid: sid.trim(),
      twilio_auth_token: token.trim(),
      twilio_phone_number: phone.trim(),
    });
    toast.success('Twilio credentials saved');
    setEditing(false);
    setSid('');
    setToken('');
  };

  const handleTest = () => {
    toast.info('Twilio test SMS requires an edge function. Contact your administrator to set this up.');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Twilio Configuration</CardTitle>
          </div>
          <Badge variant={configured ? 'default' : 'secondary'} className={configured ? 'bg-[hsl(var(--status-success))] text-white' : ''}>
            {configured ? 'Configured' : 'Not Configured'}
          </Badge>
        </div>
        <CardDescription>
          Configure Twilio credentials for automated SMS notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing && configured && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Account SID</span><span className="font-mono">{maskCredential(tenant.twilio_account_sid)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Auth Token</span><span className="font-mono">{maskCredential(tenant.twilio_auth_token)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone Number</span><span className="font-mono">{tenant.twilio_phone_number}</span></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="outline" size="sm" onClick={handleTest}>Test Connection</Button>
            </div>
          </div>
        )}
        {(editing || !configured) && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Account SID</Label>
              <Input value={sid} onChange={(e) => setSid(e.target.value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </div>
            <div className="space-y-1">
              <Label>Auth Token</Label>
              <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter auth token" />
            </div>
            <div className="space-y-1">
              <Label>Twilio Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1XXXXXXXXXX" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateTenant.isPending} size="sm">
                {updateTenant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              {editing && <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── CRL Section ───
function CrlSection({ tenant }: Props) {
  const updateTenant = useUpdateTenant();
  const [editing, setEditing] = useState(false);
  const [portalUrl, setPortalUrl] = useState(tenant.crl_portal_url || '');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState(tenant.crl_company_search_term || '');

  const configured = !!tenant.crl_login_email;

  const handleSave = async () => {
    if (!portalUrl.trim() || !loginEmail.trim() || !password.trim()) {
      toast.error('Portal URL, Login Email, and Password are required');
      return;
    }
    await updateTenant.mutateAsync({
      id: tenant.id,
      crl_portal_url: portalUrl.trim(),
      crl_login_email: loginEmail.trim(),
      crl_password: password.trim(),
      crl_company_search_term: searchTerm.trim() || null,
    });
    toast.success('CRL credentials saved');
    setEditing(false);
    setLoginEmail('');
    setPassword('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">CRL Portal</CardTitle>
          </div>
          <Badge variant={configured ? 'default' : 'secondary'} className={configured ? 'bg-[hsl(var(--status-success))] text-white' : ''}>
            {configured ? 'Configured' : 'Not Configured'}
          </Badge>
        </div>
        <CardDescription>
          Configure CRL portal credentials for automated test result retrieval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing && configured && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Portal URL</span><span className="font-mono truncate max-w-[200px]">{tenant.crl_portal_url}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Login Email</span><span className="font-mono">{maskCredential(tenant.crl_login_email)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Password</span><span className="font-mono">••••••••</span></div>
            {tenant.crl_company_search_term && (
              <div className="flex justify-between"><span className="text-muted-foreground">Search Term</span><span>{tenant.crl_company_search_term}</span></div>
            )}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        )}
        {(editing || !configured) && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Portal URL</Label>
              <Input value={portalUrl} onChange={(e) => setPortalUrl(e.target.value)} placeholder="https://portal.crlcorp.com" />
            </div>
            <div className="space-y-1">
              <Label>Login Email</Label>
              <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="login@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <div className="space-y-1">
              <Label>Company Search Term</Label>
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Optional search term" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateTenant.isPending} size="sm">
                {updateTenant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              {editing && <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentCredentials({ tenant }: Props) {
  return (
    <div className="space-y-4">
      <GmailSection tenant={tenant} />
      <TwilioSection tenant={tenant} />
      <CrlSection tenant={tenant} />
    </div>
  );
}
