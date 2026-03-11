import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTenant, Tenant } from '@/hooks/useTenants';
import { Globe, Loader2, Save, Eye, EyeOff } from 'lucide-react';

function maskValue(value: string | null): string {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return '••••••••' + value.slice(-4);
}

interface CrlConfigCardProps {
  tenant: Tenant;
}

export function CrlConfigCard({ tenant }: CrlConfigCardProps) {
  const { toast } = useToast();
  const updateTenant = useUpdateTenant();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [portalUrl, setPortalUrl] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isConfigured = !!tenant.crl_login_email;

  useEffect(() => {
    if (isEditing) {
      setPortalUrl(tenant.crl_portal_url || '');
      setLoginEmail(tenant.crl_login_email || '');
      setPassword(tenant.crl_password || '');
      setSearchTerm(tenant.crl_company_search_term || '');
      setShowPassword(false);
    }
  }, [isEditing, tenant]);

  const handleSave = async () => {
    if (!loginEmail.trim()) {
      toast({ title: 'Validation Error', description: 'Login email is required.', variant: 'destructive' });
      return;
    }
    if (!password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await updateTenant.mutateAsync({
        tenantId: tenant.id,
        updates: {
          crl_portal_url: portalUrl.trim() || null,
          crl_login_email: loginEmail.trim(),
          crl_password: password.trim(),
          crl_company_search_term: searchTerm.trim() || null,
        },
      });
      toast({ title: 'CRL Saved', description: 'CRL Portal credentials have been updated.' });
      setIsEditing(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" /> CRL Portal
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
              <Label htmlFor="crl-url">Portal URL</Label>
              <Input
                id="crl-url"
                placeholder="yourcompany.workforce.crlcorp.com"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crl-email">Login Email</Label>
              <Input
                id="crl-email"
                type="email"
                placeholder="login@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crl-password">Password</Label>
              <div className="relative">
                <Input
                  id="crl-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crl-search">Company Search Term</Label>
              <Input
                id="crl-search"
                placeholder="Company name used in CRL portal search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {tenant.crl_portal_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Portal URL</span>
                    <span className="text-sm truncate max-w-[200px]">{tenant.crl_portal_url}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Login Email</span>
                  <span className="text-sm">{tenant.crl_login_email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Password</span>
                  <span className="text-sm font-mono">{maskValue(tenant.crl_password)}</span>
                </div>
                {tenant.crl_company_search_term && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Search Term</span>
                    <span className="text-sm">{tenant.crl_company_search_term}</span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
