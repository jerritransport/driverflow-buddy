import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateSap, useUpdateSap, Sap } from '@/hooks/useSaps';
import { Loader2 } from 'lucide-react';
import { isValidUSPhone, normalizeUSPhone, formatPhoneInput } from '@/lib/phoneUtils';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const sapFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || isValidUSPhone(val),
    { message: 'Enter a valid US phone number' }
  ),
  organization: z.string().optional(),
  certification_number: z.string().optional(),
  certification_expiration: z.string().optional(),
  is_active: z.boolean(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

type SapFormValues = z.infer<typeof sapFormSchema>;

interface SapFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sap?: Sap | null;
  onSuccess?: () => void;
}

export function SapFormDialog({
  open,
  onOpenChange,
  sap,
  onSuccess,
}: SapFormDialogProps) {
  const { toast } = useToast();
  const createSap = useCreateSap();
  const updateSap = useUpdateSap();

  const isEditing = !!sap;

  const form = useForm<SapFormValues>({
    resolver: zodResolver(sapFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      organization: '',
      certification_number: '',
      certification_expiration: '',
      is_active: true,
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  // Reset form when sap changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        first_name: sap?.first_name ?? '',
        last_name: sap?.last_name ?? '',
        email: sap?.email ?? '',
        phone: sap?.phone ?? '',
        organization: sap?.organization ?? '',
        certification_number: sap?.certification_number ?? '',
        certification_expiration: sap?.certification_expiration ?? '',
        is_active: sap?.is_active ?? true,
        address_line1: sap?.address_line1 ?? '',
        address_line2: sap?.address_line2 ?? '',
        city: sap?.city ?? '',
        state: sap?.state ?? '',
        zip_code: sap?.zip_code ?? '',
      });
    }
  }, [open, sap, form]);

  const onSubmit = async (values: SapFormValues) => {
    try {
      const sapData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone ? normalizeUSPhone(values.phone) : null,
        organization: values.organization || null,
        certification_number: values.certification_number || null,
        certification_expiration: values.certification_expiration || null,
        is_active: values.is_active,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state: values.state || null,
        zip_code: values.zip_code || null,
      };

      if (isEditing && sap) {
        await updateSap.mutateAsync({
          sapId: sap.id,
          updates: sapData,
        });
        toast({
          title: 'SAP Updated',
          description: `${values.first_name} ${values.last_name} has been updated.`,
        });
      } else {
        await createSap.mutateAsync(sapData);
        toast({
          title: 'SAP Created',
          description: `${values.first_name} ${values.last_name} has been added.`,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} SAP.`,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createSap.isPending || updateSap.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit SAP' : 'Add New SAP'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the SAP information below.'
              : 'Fill in the SAP details to create a new record.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="sap@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 010-3456"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="SAP Services Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Certification Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Certification</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="certification_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Number</FormLabel>
                      <FormControl>
                        <Input placeholder="SAP-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="certification_expiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Expiration</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Suite 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Houston" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="77001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable to allow this SAP to receive driver assignments.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update SAP' : 'Create SAP'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
