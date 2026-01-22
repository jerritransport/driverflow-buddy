import { Sap } from '@/hooks/useSaps';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Award, Calendar, Building2 } from 'lucide-react';

interface SapInfoTabProps {
  sap: Sap;
}

export function SapInfoTab({ sap }: SapInfoTabProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Mail className="h-4 w-4" />
          Contact Information
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Email" value={sap.email} />
          <InfoRow label="Phone" value={sap.phone} icon={<Phone className="h-3 w-3" />} />
        </div>
      </section>

      {/* Organization */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="h-4 w-4" />
          Organization
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Organization" value={sap.organization} />
        </div>
      </section>

      {/* Address */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4" />
          Address
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Address Line 1" value={sap.address_line1} />
          {sap.address_line2 && <InfoRow label="Address Line 2" value={sap.address_line2} />}
          <InfoRow label="City" value={sap.city} />
          <InfoRow label="State" value={sap.state} />
          <InfoRow label="ZIP Code" value={sap.zip_code} />
        </div>
      </section>

      {/* Certification */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Award className="h-4 w-4" />
          Certification
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Certification Number" value={sap.certification_number} />
          <InfoRow 
            label="Expiration Date" 
            value={formatDate(sap.certification_expiration)} 
            icon={<Calendar className="h-3 w-3" />} 
          />
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
