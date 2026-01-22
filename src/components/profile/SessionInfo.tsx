import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Clock, Monitor } from 'lucide-react';
import { format } from 'date-fns';

export function SessionInfo() {
  const { session, isAdmin } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Session Information
        </CardTitle>
        <CardDescription>
          Current session and security details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Administrator' : 'Staff Member'}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            isAdmin 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {isAdmin ? 'Admin' : 'Staff'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Session Started</p>
              <p className="text-sm text-muted-foreground">
                {session?.access_token 
                  ? format(new Date(), 'PPpp')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your session will automatically expire after 1 hour of inactivity. 
          Any interaction with the app will reset this timer.
        </p>
      </CardContent>
    </Card>
  );
}
