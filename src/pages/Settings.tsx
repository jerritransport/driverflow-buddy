import { AppLayout } from '@/components/layout/AppLayout';
import { NotificationSettings, SystemDefaults, AutomationSettings, SystemHealth } from '@/components/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Bell, Sliders, Activity } from 'lucide-react';

export default function Settings() {
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
