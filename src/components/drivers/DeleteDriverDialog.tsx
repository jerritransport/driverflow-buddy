import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeleteDriver } from '@/hooks/useDriversManagement';
import { Driver } from '@/hooks/useDrivers';
import { Loader2 } from 'lucide-react';

interface DeleteDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  onSuccess?: () => void;
}

export function DeleteDriverDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: DeleteDriverDialogProps) {
  const { toast } = useToast();
  const hideDriver = useDeleteDriver();

  const handleHide = async () => {
    if (!driver) return;

    try {
      await hideDriver.mutateAsync(driver.id);
      toast({
        title: 'Driver Hidden',
        description: `${driver.first_name} ${driver.last_name} has been hidden from the active dashboard.`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to hide driver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hide Driver</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to hide{' '}
            <span className="font-medium">
              {driver?.first_name} {driver?.last_name}
            </span>
            ? This will remove them from the active dashboard but will not permanently delete their data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={hideDriver.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleHide}
            disabled={hideDriver.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {hideDriver.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hide Driver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
