import { useState } from 'react';
import { useClinicPerformance, ClinicPerformance } from '@/hooks/useClinics';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, MapPin, Star, Users, User } from 'lucide-react';

interface ClinicListViewProps {
  onSelectClinic: (clinic: ClinicPerformance) => void;
}

export function ClinicListView({ onSelectClinic }: ClinicListViewProps) {
  const { data: clinics, isLoading } = useClinicPerformance();
  const [search, setSearch] = useState('');

  const filteredClinics = clinics?.filter(
    (clinic) =>
      clinic.name?.toLowerCase().includes(search.toLowerCase()) ||
      clinic.city?.toLowerCase().includes(search.toLowerCase()) ||
      clinic.state?.toLowerCase().includes(search.toLowerCase()) ||
      clinic.zip_code?.toLowerCase().includes(search.toLowerCase())
  );

  const renderRating = (rating: number | null) => {
    if (rating === null) return <span className="text-muted-foreground">N/A</span>;
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderObserverBadges = (clinic: ClinicPerformance) => {
    return (
      <div className="flex gap-1">
        {clinic.has_male_observer && (
          <Badge variant="outline" className="text-xs">
            <User className="mr-1 h-3 w-3" />M
          </Badge>
        )}
        {clinic.has_female_observer && (
          <Badge variant="outline" className="text-xs">
            <User className="mr-1 h-3 w-3" />F
          </Badge>
        )}
        {!clinic.has_male_observer && !clinic.has_female_observer && (
          <span className="text-sm text-muted-foreground">None</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, state, or zip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredClinics?.length || 0} clinics
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Observers</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics?.map((clinic) => (
                <TableRow
                  key={clinic.id}
                  className="cursor-pointer"
                  onClick={() => onSelectClinic(clinic)}
                >
                  <TableCell>
                    <div className="font-medium">{clinic.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {clinic.city}, {clinic.state} {clinic.zip_code}
                    </div>
                  </TableCell>
                  <TableCell>{renderObserverBadges(clinic)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.tests_completed || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={clinic.completion_rate_percent || 0}
                        className="h-2 w-16"
                      />
                      <span className="text-sm text-muted-foreground">
                        {(clinic.completion_rate_percent || 0).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{renderRating(clinic.reliability_rating)}</TableCell>
                  <TableCell>
                    <Badge variant={clinic.is_active ? 'default' : 'secondary'}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClinics?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No clinics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
