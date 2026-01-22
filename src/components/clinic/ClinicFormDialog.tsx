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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateClinic, useUpdateClinic, Clinic } from '@/hooks/useClinics';
import { Loader2 } from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const clinicFormSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(5, 'ZIP code is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  escreen_id: z.string().optional(),
  hours_of_operation: z.string().optional(),
  observer_notes: z.string().optional(),
  has_male_observer: z.boolean(),
  has_female_observer: z.boolean(),
  offers_alcohol_testing: z.boolean(),
  offers_observed_collection: z.boolean(),
  accepts_escreen: z.boolean(),
  is_active: z.boolean(),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

interface ClinicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: Clinic | null;
  onSuccess?: () => void;
}

export function ClinicFormDialog({
  open,
  onOpenChange,
  clinic,
  onSuccess,
}: ClinicFormDialogProps) {
  const { toast } = useToast();
  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();

  const isEditing = !!clinic;

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      escreen_id: '',
      hours_of_operation: '',
      observer_notes: '',
      has_male_observer: false,
      has_female_observer: false,
      offers_alcohol_testing: false,
      offers_observed_collection: false,
      accepts_escreen: true,
      is_active: true,
    },
  });

  // Reset form when clinic changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: clinic?.name ?? '',
        address_line1: clinic?.address_line1 ?? '',
        address_line2: clinic?.address_line2 ?? '',
        city: clinic?.city ?? '',
        state: clinic?.state ?? '',
        zip_code: clinic?.zip_code ?? '',
        phone: clinic?.phone ?? '',
        email: clinic?.email ?? '',
        escreen_id: clinic?.escreen_id ?? '',
        hours_of_operation: clinic?.hours_of_operation ?? '',
        observer_notes: clinic?.observer_notes ?? '',
        has_male_observer: clinic?.has_male_observer ?? false,
        has_female_observer: clinic?.has_female_observer ?? false,
        offers_alcohol_testing: clinic?.offers_alcohol_testing ?? false,
        offers_observed_collection: clinic?.offers_observed_collection ?? false,
        accepts_escreen: clinic?.accepts_escreen ?? true,
        is_active: clinic?.is_active ?? true,
      });
    }
  }, [open, clinic, form]);

  const onSubmit = async (values: ClinicFormValues) => {
    try {
      const clinicData = {
        name: values.name,
        address_line1: values.address_line1,
        address_line2: values.address_line2 || null,
        city: values.city,
        state: values.state,
        zip_code: values.zip_code,
        phone: values.phone || null,
        email: values.email || null,
        escreen_id: values.escreen_id || null,
        hours_of_operation: values.hours_of_operation || null,
        observer_notes: values.observer_notes || null,
        has_male_observer: values.has_male_observer,
        has_female_observer: values.has_female_observer,
        offers_alcohol_testing: values.offers_alcohol_testing,
        offers_observed_collection: values.offers_observed_collection,
        accepts_escreen: values.accepts_escreen,
        is_active: values.is_active,
      };

      if (isEditing && clinic) {
        await updateClinic.mutateAsync({
          clinicId: clinic.id,
          updates: clinicData,
        });
        toast({
          title: 'Clinic Updated',
          description: `${values.name} has been updated.`,
        });
      } else {
        await createClinic.mutateAsync(clinicData);
        toast({
          title: 'Clinic Created',
          description: `${values.name} has been added.`,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} clinic.`,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createClinic.isPending || updateClinic.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the clinic information below.'
              : 'Fill in the clinic details to create a new record.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Medical Clinic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="clinic@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="escreen_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>eScreen ID</FormLabel>
                    <FormControl>
                      <Input placeholder="ES-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <FormLabel>Address Line 1 *</FormLabel>
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
                      <FormLabel>City *</FormLabel>
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
                      <FormLabel>State *</FormLabel>
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
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="77001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hours & Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Hours & Notes</h3>
              <FormField
                control={form.control}
                name="hours_of_operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours of Operation</FormLabel>
                    <FormControl>
                      <Input placeholder="Mon-Fri 8am-5pm, Sat 9am-1pm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observer_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observer Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes about observers or special instructions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observer Availability */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Observer Availability</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="has_male_observer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Male Observer Available</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="has_female_observer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Female Observer Available</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Services & Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Services & Status</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="offers_alcohol_testing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Alcohol Testing</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offers_observed_collection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Observed Collection</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accepts_escreen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Accepts eScreen</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
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
                {isEditing ? 'Update Clinic' : 'Create Clinic'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
