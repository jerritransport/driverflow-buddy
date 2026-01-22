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
  const deleteDriver = useDeleteDriver();

  const handleDelete = async () => {
    if (!driver) return;

    try {
      await deleteDriver.mutateAsync(driver.id);
      toast({
        title: 'Driver Deleted',
        description: `${driver.first_name} ${driver.last_name} has been removed.`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete driver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Driver</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium">
              {driver?.first_name} {driver?.last_name}
            </span>
            ? This action cannot be undone and will remove all associated records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDriver.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteDriver.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteDriver.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Driver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
