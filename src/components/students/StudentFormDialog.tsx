import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateTenant, useUpdateTenant, Tenant } from '@/hooks/useTenants';
import { Loader2 } from 'lucide-react';
import { isValidUSPhone, normalizeUSPhone, formatPhoneFinal } from '@/lib/phoneUtils';

const formSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional().refine(
    (val) => !val || isValidUSPhone(val),
    { message: 'Enter a valid US phone number' }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
}

export function StudentFormDialog({ open, onOpenChange, tenant }: StudentFormDialogProps) {
  const { toast } = useToast();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const isEditing = !!tenant;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { company_name: '', contact_email: '', contact_phone: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        company_name: tenant?.company_name ?? '',
        contact_email: tenant?.contact_email ?? '',
        contact_phone: tenant?.contact_phone ?? '',
      });
    }
  }, [open, tenant, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        company_name: values.company_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone ? normalizeUSPhone(values.contact_phone) : null,
      };

      if (isEditing && tenant) {
        await updateTenant.mutateAsync({ tenantId: tenant.id, updates: payload });
        toast({ title: 'Student Updated', description: `${values.company_name} has been updated.` });
      } else {
        await createTenant.mutateAsync(payload);
        toast({ title: 'Student Added', description: `${values.company_name} has been created.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save student.', variant: 'destructive' });
    }
  };

  const isSubmitting = createTenant.isPending || updateTenant.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update student company details.' : 'Add a new student CTPA business.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Student's CTPA Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="student@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 (555) 010-3456"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={() => {
                        field.onBlur();
                        if (field.value) field.onChange(formatPhoneFinal(field.value));
                      }}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
