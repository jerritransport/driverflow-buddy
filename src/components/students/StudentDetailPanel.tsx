import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTenant, useUpdateTenant, type Tenant } from '@/hooks/useTenants';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentCredentials } from './StudentCredentials';
import { toast } from 'sonner';

interface Props {
  tenantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailPanel({ tenantId, open, onOpenChange }: Props) {
  const { data: tenant, isLoading } = useTenant(tenantId);
  const updateTenant = useUpdateTenant();

  const handleToggleActive = async (checked: boolean) => {
    if (!tenant) return;
    await updateTenant.mutateAsync({ id: tenant.id, is_active: checked });
    toast.success(checked ? 'Student activated' : 'Student deactivated');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !tenant ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <SheetTitle className="text-xl">{tenant.company_name}</SheetTitle>
                <Badge variant={tenant.is_active ? 'default' : 'secondary'} className={tenant.is_active ? 'bg-[hsl(var(--status-success))] text-white' : ''}>
                  {tenant.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <SheetDescription>{tenant.contact_email}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="active-toggle" className="text-sm font-medium">Active Status</Label>
                <Switch
                  id="active-toggle"
                  checked={tenant.is_active}
                  onCheckedChange={handleToggleActive}
                  disabled={updateTenant.isPending}
                />
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Credential Setup</h3>
                <StudentCredentials tenant={tenant} />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
