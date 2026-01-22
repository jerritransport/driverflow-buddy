import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileForm, PasswordChangeForm, SessionInfo } from '@/components/profile';
import { UserCircle } from 'lucide-react';

export default function Profile() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UserCircle className="h-6 w-6" />
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and security preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <ProfileForm />
            <SessionInfo />
          </div>
          <div>
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
