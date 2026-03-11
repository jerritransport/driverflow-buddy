import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenants';
import { TwilioConfigCard } from '@/components/students/TwilioConfigCard';
import { CrlConfigCard } from '@/components/students/CrlConfigCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail } from 'lucide-react';

export default function StudentSettings() {
  const { tenantId } = useAuth();
  const { data: tenant, isLoading } = useTenant(tenantId);

  // Show wizard if tenant has no credentials configured yet
  const isFirstTime = tenant && !tenant.gmail_refresh_token && !tenant.twilio_account_sid && !tenant.crl_login_email;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!tenant) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No tenant record found for your account.</p>
        </div>
      </AppLayout>
    );
  }

  if (isFirstTime && !showWizard) {
    // Show the setup wizard prompt
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl space-y-6 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to {tenant.company_name}!</h1>
            <p className="text-muted-foreground">
              Let's set up your service credentials so you can start managing drivers.
            </p>
          </div>

          <div className="space-y-4">
            <SetupStep
              number={1}
              title="Connect Gmail"
              description="Connect your Gmail account to send emails to drivers automatically."
              icon={<Mail className="h-5 w-5" />}
            />
            <SetupStep
              number={2}
              title="Configure Twilio"
              description="Set up Twilio for automated SMS messages to drivers."
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <SetupStep
              number={3}
              title="Configure CRL Portal"
              description="Add your CRL Portal login credentials for test result automation."
              icon={<Globe className="h-5 w-5" />}
            />
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button onClick={() => setShowWizard(true)} className="gap-2">
              Start Setup <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Skip for Now
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your service credentials for {tenant.company_name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Company</span>
              <span className="text-sm font-medium">{tenant.company_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{tenant.contact_email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                {tenant.is_active ? 'Active' : 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="gmail">
          <TabsList>
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="twilio">Twilio</TabsTrigger>
            <TabsTrigger value="crl">CRL Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="gmail" className="mt-4">
            <GmailConfigSection tenant={tenant} />
          </TabsContent>

          <TabsContent value="twilio" className="mt-4">
            <TwilioConfigCard tenant={tenant} />
          </TabsContent>

          <TabsContent value="crl" className="mt-4">
            <CrlConfigCard tenant={tenant} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function SetupStep({ number, title, description, icon }: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">Step {number}: {title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GmailConfigSection({ tenant }: { tenant: any }) {
  const isConnected = !!tenant.gmail_refresh_token;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" /> Gmail
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {isConnected ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Connected</Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>
        {isConnected && tenant.gmail_address && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <span className="text-sm">{tenant.gmail_address}</span>
          </div>
        )}
        {!isConnected && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => {
              const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth?tenant_id=${tenant.id}`;
              window.location.href = url;
            }}
          >
            <Mail className="h-4 w-4" /> Connect Gmail
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
