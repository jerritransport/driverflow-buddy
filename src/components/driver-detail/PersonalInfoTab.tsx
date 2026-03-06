import { useState } from 'react';
import { Driver } from '@/hooks/useDrivers';
import { useUpdateDriver } from '@/hooks/useDriverDetails';
import { format } from 'date-fns';
import { User, MapPin, Briefcase, FileText, Calendar, Phone, Mail, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TestResultsSection } from './TestResultsSection';
import { formatPhoneDisplay, formatPhoneFinal, normalizeUSPhone, isValidUSPhone } from '@/lib/phoneUtils';

interface PersonalInfoTabProps {
  driver: Driver;
}

type EditableSection = 'contact' | 'address' | 'cdl' | 'employer' | null;

export function PersonalInfoTab({ driver }: PersonalInfoTabProps) {
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const updateDriver = useUpdateDriver();

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const startEditing = (section: EditableSection, initialData: Record<string, string>) => {
    setEditingSection(section);
    setFormData(initialData);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setFormData({});
  };

  const saveSection = async () => {
    if (!editingSection) return;
    
    // Validate phone if contact section
    if (editingSection === 'contact' && formData.phone) {
      if (!isValidUSPhone(formData.phone)) {
        toast.error('Enter a valid US phone number');
        return;
      }
      formData.phone = normalizeUSPhone(formData.phone);
    }
    
    // Convert empty strings to null for optional fields
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(formData)) {
      sanitized[key] = value === '' ? null : value;
    }

    try {
      await updateDriver.mutateAsync({ driverId: driver.id, updates: sanitized });
      toast.success('Driver updated successfully');
      setEditingSection(null);
      setFormData({});
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const SectionHeader = ({ icon: Icon, title, section, initialData }: { 
    icon: React.ComponentType<{ className?: string }>; 
    title: string; 
    section: EditableSection;
    initialData: Record<string, string>;
  }) => (
    <div className="mb-3 flex items-center justify-between">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </h4>
      {editingSection === section ? (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-7 w-7 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={saveSection} disabled={updateDriver.isPending} className="h-7 w-7 p-0 text-[hsl(var(--status-success))]">
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => startEditing(section, initialData)} 
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );

  const isEditing = (section: EditableSection) => editingSection === section;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <section>
        <SectionHeader 
          icon={User} 
          title="Contact Information" 
          section="contact"
          initialData={{
            first_name: driver.first_name || '',
            middle_name: driver.middle_name || '',
            last_name: driver.last_name || '',
            email: driver.email || '',
            phone: driver.phone || '',
            gender: driver.gender || '',
            date_of_birth: driver.date_of_birth || '',
          }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('contact') ? (
            <>
              <EditRow label="First Name" value={formData.first_name} onChange={v => updateField('first_name', v)} />
              <EditRow label="Middle Name" value={formData.middle_name} onChange={v => updateField('middle_name', v)} />
              <EditRow label="Last Name" value={formData.last_name} onChange={v => updateField('last_name', v)} />
              <EditRow label="Email" value={formData.email} onChange={v => updateField('email', v)} type="email" />
              <EditRow label="Phone" value={formData.phone} onChange={v => updateField('phone', v)} onBlur={() => { if (formData.phone) updateField('phone', formatPhoneFinal(formData.phone)); }} type="tel" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Gender</span>
                <Select value={formData.gender} onValueChange={v => updateField('gender', v)}>
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EditRow label="Date of Birth" value={formData.date_of_birth} onChange={v => updateField('date_of_birth', v)} type="date" />
            </>
          ) : (
            <>
              <InfoRow label="Full Name" value={`${driver.first_name} ${driver.middle_name || ''} ${driver.last_name}`.trim()} />
              <InfoRow label="Email" value={driver.email} icon={<Mail className="h-3 w-3" />} />
              <InfoRow label="Phone" value={formatPhoneDisplay(driver.phone)} icon={<Phone className="h-3 w-3" />} />
              <InfoRow label="Gender" value={driver.gender} />
              <InfoRow label="Date of Birth" value={formatDate(driver.date_of_birth)} icon={<Calendar className="h-3 w-3" />} />
            </>
          )}
        </div>
      </section>

      {/* Address */}
      <section>
        <SectionHeader 
          icon={MapPin} 
          title="Address" 
          section="address"
          initialData={{
            address_line1: driver.address_line1 || '',
            address_line2: driver.address_line2 || '',
            city: driver.city || '',
            state: driver.state || '',
            zip_code: driver.zip_code || '',
          }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('address') ? (
            <>
              <EditRow label="Address Line 1" value={formData.address_line1} onChange={v => updateField('address_line1', v)} />
              <EditRow label="Address Line 2" value={formData.address_line2} onChange={v => updateField('address_line2', v)} />
              <EditRow label="City" value={formData.city} onChange={v => updateField('city', v)} />
              <EditRow label="State" value={formData.state} onChange={v => updateField('state', v)} />
              <EditRow label="ZIP Code" value={formData.zip_code} onChange={v => updateField('zip_code', v)} />
            </>
          ) : (
            <>
              <InfoRow label="Address Line 1" value={driver.address_line1} />
              {driver.address_line2 && <InfoRow label="Address Line 2" value={driver.address_line2} />}
              <InfoRow label="City" value={driver.city} />
              <InfoRow label="State" value={driver.state} />
              <InfoRow label="ZIP Code" value={driver.zip_code} />
            </>
          )}
        </div>
      </section>

      {/* CDL Information */}
      <section>
        <SectionHeader 
          icon={FileText} 
          title="CDL Information" 
          section="cdl"
          initialData={{
            cdl_number: driver.cdl_number || '',
            cdl_state: driver.cdl_state || '',
            cdl_expiration: driver.cdl_expiration || '',
          }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('cdl') ? (
            <>
              <EditRow label="CDL Number" value={formData.cdl_number} onChange={v => updateField('cdl_number', v)} />
              <EditRow label="State" value={formData.cdl_state} onChange={v => updateField('cdl_state', v)} />
              <EditRow label="Expiration" value={formData.cdl_expiration} onChange={v => updateField('cdl_expiration', v)} type="date" />
            </>
          ) : (
            <>
              <InfoRow label="CDL Number" value={driver.cdl_number} />
              <InfoRow label="State" value={driver.cdl_state} />
              <InfoRow label="Expiration" value={formatDate(driver.cdl_expiration)} />
            </>
          )}
        </div>
      </section>

      {/* Employer Information */}
      {(driver.employer_name || (driver as any).employer_contact_name || driver.employer_contact || isEditing('employer')) && (
        <section>
          <SectionHeader 
            icon={Briefcase} 
            title="Employer Information" 
            section="employer"
            initialData={{
              employer_name: driver.employer_name || '',
              employer_contact_name: (driver as any).employer_contact_name || driver.employer_contact || '',
              employer_job_title: (driver as any).employer_job_title || '',
              employer_phone: (driver as any).employer_phone || '',
            }}
          />
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
            {isEditing('employer') ? (
              <>
                <EditRow label="Employer Name" value={formData.employer_name} onChange={v => updateField('employer_name', v)} />
                <EditRow label="Contact Name" value={formData.employer_contact_name} onChange={v => updateField('employer_contact_name', v)} />
                <EditRow label="Job Title" value={formData.employer_job_title} onChange={v => updateField('employer_job_title', v)} />
                <EditRow label="Contact Phone" value={formData.employer_phone} onChange={v => updateField('employer_phone', v)} type="tel" />
              </>
            ) : (
              <>
                <InfoRow label="Employer Name" value={driver.employer_name} />
                <InfoRow label="Contact Name" value={(driver as any).employer_contact_name || driver.employer_contact} />
                <InfoRow label="Job Title" value={(driver as any).employer_job_title} />
                <InfoRow label="Contact Phone" value={(driver as any).employer_phone} icon={<Phone className="h-3 w-3" />} />
              </>
            )}
          </div>
        </section>
      )}

      {/* Test Results Section */}
      <TestResultsSection driver={driver} />
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-sm font-medium">
        {icon}
        {value || 'N/A'}
      </span>
    </div>
  );
}

function EditRow({ label, value, onChange, onBlur, type = 'text' }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <Input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onBlur={onBlur}
        type={type}
        className="h-8 w-40 text-sm"
      />
    </div>
  );
}
