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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateDriver, CreateDriverData } from '@/hooks/useDriversManagement';
import { useUpdateDriver } from '@/hooks/useDriverDetails';
import { Driver } from '@/hooks/useDrivers';
import { useSaps, useCreateSap } from '@/hooks/useSaps';
import { useTenants } from '@/hooks/useTenants';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { isValidUSPhone, normalizeUSPhone, formatPhoneFinal } from '@/lib/phoneUtils';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const driverFormSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  middle_name: z.string().max(100).optional(),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidUSPhone(val),
    { message: 'Enter a valid US phone number, e.g. (555) 123-4567' }
  ),
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
  tenant_id: z.string().optional(),
  sap_requirement: z.enum(['none', 'needs_sap']).optional(),
  sap_id: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  onSuccess?: () => void;
}

// Inline mini form for quick SAP creation
function InlineSapForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const createSap = useCreateSap();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!firstName || !lastName || !email) {
      toast({ title: 'Required', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    try {
      const sap = await createSap.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone ? normalizeUSPhone(phone) : null,
        is_active: true,
        organization: null,
        certification_number: null,
        certification_expiration: null,
        address_line1: null,
        address_line2: null,
        city: null,
        state: null,
        zip_code: null,
      });
      toast({ title: 'SAP Created', description: `${firstName} ${lastName} added.` });
      onCreated(sap.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create SAP', variant: 'destructive' });
    }
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-medium">Add New SAP Counselor</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input placeholder="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="Phone (US +1)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => { if (phone) setPhone(formatPhoneFinal(phone)); }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleCreate} disabled={createSap.isPending}>
          {createSap.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Save SAP
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
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
  const [showAddSap, setShowAddSap] = useState(false);

  const { data: saps } = useSaps();
  const activeSaps = saps?.filter(s => s.is_active) || [];
  const { data: tenants } = useTenants();
  const activeTenants = tenants?.filter(t => t.is_active) || [];

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
      tenant_id: driver?.tenant_id ?? undefined,
      sap_requirement: driver?.sap_id ? 'needs_sap' : 'none',
      sap_id: driver?.sap_id ?? undefined,
    },
  });

  const sapRequirement = form.watch('sap_requirement');

  const onSubmit = async (values: DriverFormValues) => {
    try {
      const cleanedValues = {
        ...values,
        phone: normalizeUSPhone(values.phone),
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
        employer_phone: values.employer_phone ? normalizeUSPhone(values.employer_phone) : undefined,
        sap_id: values.sap_requirement === 'needs_sap' ? values.sap_id || undefined : undefined,
        tenant_id: values.tenant_id || undefined,
      };

      // Determine follow-up date based on SAP requirement
      let follow_up_date: string | undefined;
      let follow_up_note: string | undefined;
      if (values.sap_requirement === 'needs_sap' && !isEditing) {
        follow_up_date = format(addDays(new Date(), 3), 'yyyy-MM-dd');
        follow_up_note = 'Follow-up: Confirm SAP counselor setup';
      }

      // Remove form-only fields before sending
      const { sap_requirement, ...dataToSend } = cleanedValues;

      if (isEditing && driver) {
        await updateDriver.mutateAsync({
          driverId: driver.id,
          updates: {
            ...dataToSend,
            ...(follow_up_date ? { follow_up_date, follow_up_note } : {}),
          },
        });
        toast({
          title: 'Driver Updated',
          description: `${values.first_name} ${values.last_name} has been updated.`,
        });
      } else {
        const createData = {
          ...dataToSend,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: normalizeUSPhone(values.phone),
          ...(follow_up_date ? { follow_up_date, follow_up_note } : {}),
        } as CreateDriverData;
        const newDriver = await createDriver.mutateAsync(createData);
        
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
          description: `${values.first_name} ${values.last_name} has been added.${values.sap_requirement === 'needs_sap' ? ' SAP follow-up set for 3 days.' : ''}`,
        });
      }
      setUploadFiles([]);
      setShowAddSap(false);
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
                      <FormLabel>Phone * (US +1)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={() => {
                            field.onBlur();
                            if (field.value) field.onChange(formatPhoneFinal(field.value));
                          }}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>US numbers only (+1)</FormDescription>
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

            {/* SAP Counselor Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">SAP Counselor Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-1">
                <FormField
                  control={form.control}
                  name="employer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 987-6543"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={() => {
                            field.onBlur();
                            if (field.value) field.onChange(formatPhoneFinal(field.value));
                          }}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SAP Counselor */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">SAP Counselor</h3>

              <FormField
                control={form.control}
                name="sap_requirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SAP Requirement</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value || 'none'}
                        onValueChange={field.onChange}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="none" id="sap-none" />
                          <Label htmlFor="sap-none" className="font-normal">No SAP Needed</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="needs_sap" id="sap-needs" />
                          <Label htmlFor="sap-needs" className="font-normal">Needs SAP Counselor</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    {field.value === 'needs_sap' && (
                      <FormDescription>
                        A 3-day follow-up will be set to confirm SAP setup, then 7 days to confirm completion.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {sapRequirement === 'needs_sap' && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="sap_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select SAP Counselor</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Choose a SAP counselor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {activeSaps.map((sap) => (
                                <SelectItem key={sap.id} value={sap.id}>
                                  {sap.first_name} {sap.last_name}
                                  {sap.organization ? ` — ${sap.organization}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowAddSap(true)}
                            title="Add new SAP"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showAddSap && (
                    <InlineSapForm
                      onCreated={(id) => {
                        form.setValue('sap_id', id);
                        setShowAddSap(false);
                      }}
                      onCancel={() => setShowAddSap(false)}
                    />
                  )}

                  {/* Show selected SAP info */}
                  {form.watch('sap_id') && (() => {
                    const selected = activeSaps.find(s => s.id === form.watch('sap_id'));
                    if (!selected) return null;
                    return (
                      <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-1">
                        <p className="font-medium">{selected.first_name} {selected.last_name}</p>
                        <p className="text-muted-foreground">{selected.email}</p>
                        {selected.phone && <p className="text-muted-foreground">{selected.phone}</p>}
                        {selected.organization && <p className="text-muted-foreground">{selected.organization}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Staff Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Staff Assignment</h3>
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Staff</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Staff" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Assign this driver to a staff member</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
