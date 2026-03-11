import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription className="text-base">
            Your registration has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-foreground">Registration Complete</span>
            </div>
            <p>
              An administrator will review your account shortly. Once approved, 
              you'll be able to log in and configure your service credentials.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            You'll receive access once your account has been activated.
          </p>
          <Button variant="outline" onClick={() => navigate('/login')} className="mt-4">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
