import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Clock, RefreshCw } from 'lucide-react';

export function AutomationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Settings
        </CardTitle>
        <CardDescription>
          Configure automated workflows and integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="auto-designation" className="font-medium">
                Auto Designation Query
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically run designation queries when drivers reach step 4
              </p>
            </div>
          </div>
          <Switch id="auto-designation" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="auto-donor-pass" className="font-medium">
                Auto Donor Pass Generation
              </Label>
              <p className="text-sm text-muted-foreground">
                Generate and send donor passes when clearinghouse clears
              </p>
            </div>
          </div>
          <Switch id="auto-donor-pass" defaultChecked />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="stale-threshold" className="font-medium">
              Stale Driver Alert Threshold
            </Label>
          </div>
          <Select defaultValue="3">
            <SelectTrigger id="stale-threshold">
              <SelectValue placeholder="Select threshold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="2">2 days</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="5">5 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Flag drivers as needing attention after this many days of inactivity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
