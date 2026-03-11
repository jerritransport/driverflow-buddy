import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant, useUpdateTenant } from '@/hooks/useTenants';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isValidUSPhone, normalizeUSPhone, formatPhoneFinal } from '@/lib/phoneUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Globe, Mail, MessageSquare, CheckCircle2, Loader2, Save,
  Eye, EyeOff, Send, ExternalLink, ArrowRight, ArrowLeft, Rocket,
} from 'lucide-react';

export default function StudentSetupWizard() {
  const { tenantId } = useAuth();
  const { data: tenant, isLoading, refetch } = useTenant(tenantId);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Determine completed steps from tenant data
  const crlDone = !!tenant?.crl_login_email;
  const gmailDone = !!tenant?.gmail_refresh_token;
  const twilioDone = !!tenant?.twilio_account_sid;
  const allDone = crlDone && gmailDone && twilioDone;

  // Auto-advance to first incomplete step
  useEffect(() => {
    if (!tenant) return;
    if (!crlDone) setCurrentStep(1);
    else if (!gmailDone) setCurrentStep(2);
    else if (!twilioDone) setCurrentStep(3);
    else setCurrentStep(4); // completion
  }, [tenant, crlDone, gmailDone, twilioDone]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">No tenant record found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-center mb-2">
            Set Up Your RTD Pipeline
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Complete all 3 steps to start managing drivers for {tenant.company_name}
          </p>
          <StepProgress current={currentStep} crlDone={crlDone} gmailDone={gmailDone} twilioDone={twilioDone} />
        </div>

        {currentStep === 1 && (
          <CrlStep tenant={tenant} onComplete={() => { refetch(); setCurrentStep(2); }} />
        )}
        {currentStep === 2 && (
          <GmailStep tenant={tenant} onComplete={() => refetch()} onBack={crlDone ? undefined : () => setCurrentStep(1)} />
        )}
        {currentStep === 3 && (
          <TwilioStep tenant={tenant} onComplete={() => { refetch(); setCurrentStep(4); }} onBack={() => setCurrentStep(2)} />
        )}
        {currentStep === 4 && allDone && (
          <CompletionStep onContinue={() => navigate('/', { replace: true })} />
        )}
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function StepProgress({ current, crlDone, gmailDone, twilioDone }: {
  current: number; crlDone: boolean; gmailDone: boolean; twilioDone: boolean;
}) {
  const steps = [
    { num: 1, label: 'CRL Portal', done: crlDone, icon: Globe },
    { num: 2, label: 'Gmail', done: gmailDone, icon: Mail },
    { num: 3, label: 'Twilio', done: twilioDone, icon: MessageSquare },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            s.done
              ? 'bg-primary/10 text-primary'
              : current === s.num
                ? 'bg-accent text-accent-foreground ring-2 ring-primary'
                : 'bg-muted text-muted-foreground'
          }`}>
            {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
            {s.label}
          </div>
          {i < 2 && <div className={`h-px w-6 ${s.done ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1: CRL ─── */
function CrlStep({ tenant, onComplete }: { tenant: any; onComplete: () => void }) {
  const { toast } = useToast();
  const updateTenant = useUpdateTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [portalUrl, setPortalUrl] = useState(tenant.crl_portal_url || '');
  const [loginEmail, setLoginEmail] = useState(tenant.crl_login_email || '');
  const [password, setPassword] = useState(tenant.crl_password || '');
  const [searchTerm, setSearchTerm] = useState(tenant.crl_company_search_term || '');

  const handleSave = async () => {
    if (!loginEmail.trim()) {
      toast({ title: 'Required', description: 'Login email is required.', variant: 'destructive' });
      return;
    }
    if (!password.trim()) {
      toast({ title: 'Required', description: 'Password is required.', variant: 'destructive' });
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
      toast({ title: 'CRL Configured', description: 'Portal credentials saved successfully.' });
      onComplete();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Connect Your CRL Workforce Account
        </CardTitle>
        <CardDescription>
          You need your own CRL Workforce account. If you don't have one yet,
          contact CRL directly to set it up. Each account has a unique portal URL
          like <span className="font-mono text-xs">yourcompany.workforce.crlcorp.com</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="crl-email">Login Email *</Label>
          <Input
            id="crl-email"
            type="email"
            placeholder="login@example.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crl-password">Password *</Label>
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

        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => setShowHelp(!showHelp)}
        >
          I don't have a CRL account yet
        </button>

        {showHelp && (
          <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium">How to get a CRL Workforce account:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Contact CRL at <span className="font-medium text-foreground">(800) 747-0794</span></li>
              <li>Request a Workforce Portal account for your company</li>
              <li>CRL will set up your unique portal URL and login credentials</li>
              <li>Once you have them, enter them above</li>
            </ol>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Save & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 2: Gmail ─── */
function GmailStep({ tenant, onComplete, onBack }: {
  tenant: any; onComplete: () => void; onBack?: () => void;
}) {
  const isConnected = !!tenant.gmail_refresh_token;

  const handleConnect = () => {
    const redirectUrl = `${window.location.origin}/auth/gmail/callback`;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth?action=initiate`;
    
    // POST to initiate, then redirect
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenant.id, redirect_url: redirectUrl }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.auth_url) {
          window.location.href = data.auth_url;
        }
      })
      .catch(console.error);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Connect Your Gmail
        </CardTitle>
        <CardDescription>
          This Gmail account will be used to send emails to your drivers.
          Drivers will see this as the sender address. You can use a personal
          or business Gmail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="rounded-md border bg-primary/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Gmail Connected</p>
              {tenant.gmail_address && (
                <p className="text-sm text-muted-foreground">{tenant.gmail_address}</p>
              )}
            </div>
          </div>
        ) : (
          <Button onClick={handleConnect} variant="outline" className="w-full gap-2">
            <Mail className="h-4 w-4" />
            Connect Gmail Account
          </Button>
        )}

        <div className="flex justify-between pt-2">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <div className="ml-auto">
            {isConnected && (
              <Button onClick={onComplete} className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 3: Twilio ─── */
function TwilioStep({ tenant, onComplete, onBack }: {
  tenant: any; onComplete: () => void; onBack: () => void;
}) {
  const { toast } = useToast();
  const updateTenant = useUpdateTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [accountSid, setAccountSid] = useState(tenant.twilio_account_sid || '');
  const [authToken, setAuthToken] = useState(tenant.twilio_auth_token || '');
  const [phoneNumber, setPhoneNumber] = useState(tenant.twilio_phone_number || '');

  const isConfigured = !!tenant.twilio_account_sid;

  const handleSave = async () => {
    if (!accountSid.trim()) {
      toast({ title: 'Required', description: 'Account SID is required.', variant: 'destructive' });
      return;
    }
    if (!authToken.trim()) {
      toast({ title: 'Required', description: 'Auth Token is required.', variant: 'destructive' });
      return;
    }
    if (!phoneNumber.trim() || !isValidUSPhone(phoneNumber)) {
      toast({ title: 'Required', description: 'Enter a valid US phone number.', variant: 'destructive' });
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
      toast({ title: 'Twilio Configured', description: 'Credentials saved successfully.' });
      onComplete();
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
      if (!session) return;
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
      if (!resp.ok) throw new Error(result.error || 'Test failed');
      toast({ title: 'Test SMS Sent', description: result.message });
    } catch (err: any) {
      toast({ title: 'Test Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Connect Your Twilio Account
        </CardTitle>
        <CardDescription>
          Twilio is used to send SMS to your drivers. Create a free account at
          twilio.com. You'll need a phone number (~$1/month) and your API
          credentials. Cost is ~$0.01 per SMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <a
          href="https://www.twilio.com/try-twilio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Create a Twilio account <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <div className="space-y-2">
          <Label htmlFor="twilio-sid">Account SID *</Label>
          <Input
            id="twilio-sid"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twilio-token">Auth Token *</Label>
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
          <Label htmlFor="twilio-phone">Phone Number *</Label>
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

        {isConfigured && (
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
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Save & Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Completion ─── */
function CompletionStep({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="text-center">
      <CardContent className="pt-8 pb-8 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your RTD pipeline is ready to accept drivers. You can update these
          credentials anytime from your settings page.
        </p>
        <Button onClick={onContinue} size="lg" className="gap-2 mt-2">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
