import { Clinic } from '@/hooks/useClinics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock, User, Beaker, Star } from 'lucide-react';

interface ClinicInfoTabProps {
  clinic: Clinic;
}

export function ClinicInfoTab({ clinic }: ClinicInfoTabProps) {
  const renderRating = (rating: number | null) => {
    if (rating === null) return 'Not rated';
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p>{clinic.address_line1}</p>
              {clinic.address_line2 && <p>{clinic.address_line2}</p>}
              <p>
                {clinic.city}, {clinic.state} {clinic.zip_code}
              </p>
            </div>
          </div>
          {clinic.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${clinic.phone}`} className="text-primary hover:underline">
                {clinic.phone}
              </a>
            </div>
          )}
          {clinic.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${clinic.email}`} className="text-primary hover:underline">
                {clinic.email}
              </a>
            </div>
          )}
          {clinic.hours_of_operation && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="whitespace-pre-line">{clinic.hours_of_operation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Observer Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Male Observer</span>
            </div>
            <Badge variant={clinic.has_male_observer ? 'default' : 'secondary'}>
              {clinic.has_male_observer ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Female Observer</span>
            </div>
            <Badge variant={clinic.has_female_observer ? 'default' : 'secondary'}>
              {clinic.has_female_observer ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          {clinic.observer_notes && (
            <div className="mt-2 rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">{clinic.observer_notes}</p>
            </div>
          )}
          {clinic.last_observer_verification_date && (
            <p className="text-xs text-muted-foreground">
              Last verified:{' '}
              {new Date(clinic.last_observer_verification_date).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Services & Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-muted-foreground" />
              <span>Observed Collection</span>
            </div>
            <Badge variant={clinic.offers_observed_collection ? 'default' : 'secondary'}>
              {clinic.offers_observed_collection ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-muted-foreground" />
              <span>Alcohol Testing</span>
            </div>
            <Badge variant={clinic.offers_alcohol_testing ? 'default' : 'secondary'}>
              {clinic.offers_alcohol_testing ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Accepts eScreen</span>
            <Badge variant={clinic.accepts_escreen ? 'default' : 'secondary'}>
              {clinic.accepts_escreen ? 'Yes' : 'No'}
            </Badge>
          </div>
          {clinic.escreen_id && (
            <div className="text-sm text-muted-foreground">
              eScreen ID: <span className="font-mono">{clinic.escreen_id}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Reliability Rating</span>
            {renderRating(clinic.reliability_rating)}
          </div>
          <div className="flex items-center justify-between">
            <span>Total Tests Completed</span>
            <span className="font-medium">{clinic.total_tests_completed || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
