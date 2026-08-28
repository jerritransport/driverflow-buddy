import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotificationSettings, SystemDefaults, AutomationSettings, SystemHealth } from '@/components/settings';
import { GmailConnectCard } from '@/components/settings/GmailConnectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Bell, Sliders, Activity, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const gmailSuccess = searchParams.get('gmail_success');
    const gmailError = searchParams.get('gmail_error');
    if (gmailSuccess) {
      toast.success('Gmail connected successfully.');
      setSearchParams((params) => {
        params.delete('gmail_success');
        params.delete('tenant_id');
        return params;
      });
    } else if (gmailError) {
      toast.error(`Failed to connect Gmail: ${gmailError}`);
      setSearchParams((params) => {
        params.delete('gmail_error');
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system preferences and automation settings.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SystemDefaults />
              <AutomationSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="max-w-2xl">
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="email">
            <div className="max-w-2xl">
              <GmailConnectCard />
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="max-w-2xl">
              <SystemHealth />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
