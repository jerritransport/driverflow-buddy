import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="email-alerts" className="font-medium">
                Email Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
          </div>
          <Switch id="email-alerts" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="sms-alerts" className="font-medium">
                SMS Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get text messages for urgent driver alerts
              </p>
            </div>
          </div>
          <Switch id="sms-alerts" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="browser-notifications" className="font-medium">
                Browser Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show desktop notifications when app is open
              </p>
            </div>
          </div>
          <Switch id="browser-notifications" defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
