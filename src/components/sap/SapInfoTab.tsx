import { useState } from 'react';
import { Sap, useUpdateSap } from '@/hooks/useSaps';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Award, Calendar, Building2, Pencil, Check, X } from 'lucide-react';
import { formatPhoneDisplay, formatPhoneInput, normalizeUSPhone, isValidUSPhone } from '@/lib/phoneUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SapInfoTabProps {
  sap: Sap;
}

type EditableSection = 'contact' | 'organization' | 'address' | 'certification' | null;

export function SapInfoTab({ sap }: SapInfoTabProps) {
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const updateSap = useUpdateSap();

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
    
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'phone' && value) {
        if (!isValidUSPhone(value as string)) {
          toast.error('Enter a valid US phone number');
          return;
        }
        sanitized[key] = normalizeUSPhone(value as string);
      } else {
        sanitized[key] = value === '' ? null : value;
      }
    }

    try {
      await updateSap.mutateAsync({ sapId: sap.id, updates: sanitized });
      toast.success('SAP updated successfully');
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
          <Button size="sm" variant="ghost" onClick={saveSection} disabled={updateSap.isPending} className="h-7 w-7 p-0 text-[hsl(var(--status-success))]">
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
          icon={Mail} 
          title="Contact Information" 
          section="contact"
          initialData={{
            first_name: sap.first_name || '',
            last_name: sap.last_name || '',
            email: sap.email || '',
            phone: sap.phone || '',
          }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('contact') ? (
            <>
              <EditRow label="First Name" value={formData.first_name} onChange={v => updateField('first_name', v)} />
              <EditRow label="Last Name" value={formData.last_name} onChange={v => updateField('last_name', v)} />
              <EditRow label="Email" value={formData.email} onChange={v => updateField('email', v)} type="email" />
              <EditRow label="Phone" value={formData.phone} onChange={v => updateField('phone', formatPhoneInput(v))} type="tel" />
            </>
          ) : (
            <>
              <InfoRow label="Name" value={`${sap.first_name} ${sap.last_name}`} />
              <InfoRow label="Email" value={sap.email} />
              <InfoRow label="Phone" value={formatPhoneDisplay(sap.phone)} icon={<Phone className="h-3 w-3" />} />
            </>
          )}
        </div>
      </section>

      {/* Organization */}
      <section>
        <SectionHeader 
          icon={Building2} 
          title="Organization" 
          section="organization"
          initialData={{ organization: sap.organization || '' }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('organization') ? (
            <EditRow label="Organization" value={formData.organization} onChange={v => updateField('organization', v)} />
          ) : (
            <InfoRow label="Organization" value={sap.organization} />
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
            address_line1: sap.address_line1 || '',
            address_line2: sap.address_line2 || '',
            city: sap.city || '',
            state: sap.state || '',
            zip_code: sap.zip_code || '',
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
              <InfoRow label="Address Line 1" value={sap.address_line1} />
              {sap.address_line2 && <InfoRow label="Address Line 2" value={sap.address_line2} />}
              <InfoRow label="City" value={sap.city} />
              <InfoRow label="State" value={sap.state} />
              <InfoRow label="ZIP Code" value={sap.zip_code} />
            </>
          )}
        </div>
      </section>

      {/* Certification */}
      <section>
        <SectionHeader 
          icon={Award} 
          title="Certification" 
          section="certification"
          initialData={{
            certification_number: sap.certification_number || '',
            certification_expiration: sap.certification_expiration || '',
          }}
        />
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          {isEditing('certification') ? (
            <>
              <EditRow label="Certification Number" value={formData.certification_number} onChange={v => updateField('certification_number', v)} />
              <EditRow label="Expiration Date" value={formData.certification_expiration} onChange={v => updateField('certification_expiration', v)} type="date" />
            </>
          ) : (
            <>
              <InfoRow label="Certification Number" value={sap.certification_number} />
              <InfoRow 
                label="Expiration Date" 
                value={formatDate(sap.certification_expiration)} 
                icon={<Calendar className="h-3 w-3" />} 
              />
            </>
          )}
        </div>
      </section>

      {/* Metadata */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="h-4 w-4" />
          Record Info
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Created" value={formatDate(sap.created_at)} />
          <InfoRow label="Last Updated" value={formatDate(sap.updated_at)} />
        </div>
      </section>
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

function EditRow({ label, value, onChange, type = 'text' }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <Input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        type={type}
        className="h-8 w-40 text-sm"
      />
    </div>
  );
}
