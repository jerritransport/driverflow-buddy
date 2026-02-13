import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
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
  FormDescription,
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
import { useCreateDriver, CreateDriverData } from '@/hooks/useDriversManagement';
import { useUpdateDriver } from '@/hooks/useDriverDetails';
import { Driver } from '@/hooks/useDrivers';
import { Loader2, Upload, X } from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const driverFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.string().optional(),
  cdl_number: z.string().optional(),
  cdl_state: z.string().optional(),
  cdl_expiration: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  employer_name: z.string().optional(),
  employer_contact_name: z.string().optional(),
  employer_job_title: z.string().optional(),
  employer_phone: z.string().optional(),
  amount_due: z.coerce.number().min(0).optional(),
  requires_alcohol_test: z.boolean().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  onSuccess?: () => void;
}

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: DriverFormDialogProps) {
  const { toast } = useToast();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const [uploadFiles, setUploadFiles] = useState<{ file: File; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!driver;

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      first_name: driver?.first_name ?? '',
      last_name: driver?.last_name ?? '',
      middle_name: driver?.middle_name ?? '',
      email: driver?.email ?? '',
      phone: driver?.phone ?? '',
      gender: (driver?.gender as 'Male' | 'Female' | 'Other') ?? undefined,
      date_of_birth: driver?.date_of_birth ?? '',
      cdl_number: driver?.cdl_number ?? '',
      cdl_state: driver?.cdl_state ?? undefined,
      cdl_expiration: driver?.cdl_expiration ?? '',
      address_line1: driver?.address_line1 ?? '',
      address_line2: driver?.address_line2 ?? '',
      city: driver?.city ?? '',
      state: driver?.state ?? undefined,
      zip_code: driver?.zip_code ?? '',
      employer_name: driver?.employer_name ?? '',
      employer_contact_name: (driver as any)?.employer_contact_name ?? driver?.employer_contact ?? '',
      employer_job_title: (driver as any)?.employer_job_title ?? '',
      employer_phone: (driver as any)?.employer_phone ?? '',
      amount_due: driver?.amount_due ?? 450,
      requires_alcohol_test: driver?.requires_alcohol_test ?? false,
    },
  });

  const onSubmit = async (values: DriverFormValues) => {
    try {
      // Clean empty strings to undefined for optional fields
      const cleanedValues = {
        ...values,
        middle_name: values.middle_name || undefined,
        gender: values.gender || undefined,
        date_of_birth: values.date_of_birth || undefined,
        cdl_number: values.cdl_number || undefined,
        cdl_state: values.cdl_state || undefined,
        cdl_expiration: values.cdl_expiration || undefined,
        address_line1: values.address_line1 || undefined,
        address_line2: values.address_line2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zip_code: values.zip_code || undefined,
        employer_name: values.employer_name || undefined,
        employer_contact_name: values.employer_contact_name || undefined,
        employer_job_title: values.employer_job_title || undefined,
        employer_phone: values.employer_phone || undefined,
      };

      if (isEditing && driver) {
        await updateDriver.mutateAsync({
          driverId: driver.id,
          updates: cleanedValues,
        });
        toast({
          title: 'Driver Updated',
          description: `${values.first_name} ${values.last_name} has been updated.`,
        });
      } else {
        const newDriver = await createDriver.mutateAsync(cleanedValues as CreateDriverData);
        
        // Upload files if any
        if (uploadFiles.length > 0 && newDriver?.id) {
          for (const { file, type } of uploadFiles) {
            const storagePath = `${newDriver.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('rtd-documents')
              .upload(storagePath, file);
            
            if (!uploadError) {
              await supabase.from('documents').insert({
                driver_id: newDriver.id,
                document_type: type,
                file_name: file.name,
                file_size_bytes: file.size,
                mime_type: file.type,
                storage_path: storagePath,
                storage_bucket: 'rtd-documents',
              });
            }
          }
        }
        
        toast({
          title: 'Driver Created',
          description: `${values.first_name} ${values.last_name} has been added.`,
        });
      }
      setUploadFiles([]);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${isEditing ? 'update' : 'create'} driver.`,
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createDriver.isPending || updateDriver.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the driver information below.'
              : 'Fill in the driver details to create a new record.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-3">
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
                  name="middle_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="M" {...field} />
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
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CDL Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">CDL Information</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cdl_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CDL Number</FormLabel>
                      <FormControl>
                        <Input placeholder="D1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cdl_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CDL State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                  name="cdl_expiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CDL Expiration</FormLabel>
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
                        <Input placeholder="Apt 4B" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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

            {/* Employer */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Employer Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Trucking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employer_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employer_job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="HR Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Billing & Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Billing & Options</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount_due"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Due ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>Default is $450</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requires_alcohol_test"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requires Alcohol Test</FormLabel>
                        <FormDescription>
                          Enable if driver needs alcohol testing
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Document Uploads (new drivers only) */}
            {!isEditing && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Documents (Optional)</h3>
                <div className="space-y-3">
                  {uploadFiles.map((uf, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 text-sm">
                      <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{uf.file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{uf.type}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Auto-detect type from name or default to CDL Photo
                        const type = file.name.toLowerCase().includes('cdl') ? 'CDL Photo'
                          : file.name.toLowerCase().includes('intake') ? 'Intake Form'
                          : 'CDL Photo';
                        setUploadFiles(prev => [...prev, { file, type }]);
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Attach Document
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Attach CDL photo, intake form, or other documents. You can also upload later from the driver detail panel.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Driver' : 'Create Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
