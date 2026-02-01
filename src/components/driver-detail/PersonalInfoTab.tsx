import { Driver } from '@/hooks/useDrivers';
import { format } from 'date-fns';
import { User, MapPin, Briefcase, FileText, Calendar, Phone, Mail } from 'lucide-react';
import { TestResultsSection } from './TestResultsSection';

interface PersonalInfoTabProps {
  driver: Driver;
}

export function PersonalInfoTab({ driver }: PersonalInfoTabProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4" />
          Contact Information
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Full Name" value={`${driver.first_name} ${driver.middle_name || ''} ${driver.last_name}`.trim()} />
          <InfoRow label="Email" value={driver.email} icon={<Mail className="h-3 w-3" />} />
          <InfoRow label="Phone" value={driver.phone} icon={<Phone className="h-3 w-3" />} />
          <InfoRow label="Gender" value={driver.gender} />
          <InfoRow label="Date of Birth" value={formatDate(driver.date_of_birth)} icon={<Calendar className="h-3 w-3" />} />
        </div>
      </section>

      {/* Address */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4" />
          Address
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="Address Line 1" value={driver.address_line1} />
          {driver.address_line2 && <InfoRow label="Address Line 2" value={driver.address_line2} />}
          <InfoRow label="City" value={driver.city} />
          <InfoRow label="State" value={driver.state} />
          <InfoRow label="ZIP Code" value={driver.zip_code} />
        </div>
      </section>

      {/* CDL Information */}
      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4" />
          CDL Information
        </h4>
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="CDL Number" value={driver.cdl_number} />
          <InfoRow label="State" value={driver.cdl_state} />
          <InfoRow label="Expiration" value={formatDate(driver.cdl_expiration)} />
        </div>
      </section>

      {/* Employer Information */}
      {(driver.employer_name || driver.employer_contact) && (
        <section>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-4 w-4" />
            Employer Information
          </h4>
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
            <InfoRow label="Employer Name" value={driver.employer_name} />
            <InfoRow label="Employer Contact" value={driver.employer_contact} />
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
