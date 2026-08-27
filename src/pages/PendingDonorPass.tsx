import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PendingDonorPassCard } from '@/components/pending-donor-pass/PendingDonorPassCard';
import { DriverDetailPanel } from '@/components/driver-detail';
import { usePendingDonorPass } from '@/hooks/usePendingDonorPass';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search } from 'lucide-react';

export default function PendingDonorPass() {
  const [search, setSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data: drivers, isLoading } = usePendingDonorPass({ search });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FileText className="h-6 w-6" />
            Pending Donor Pass
          </h1>
          <p className="text-muted-foreground">
            Drivers waiting on a donor pass — create each one manually in eScreen
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or CDL number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : drivers && drivers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver) => (
              <PendingDonorPassCard
                key={driver.id}
                driver={driver}
                onViewDriver={setSelectedDriverId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No drivers pending a donor pass</p>
              <p className="text-sm text-muted-foreground mt-1">
                Drivers will appear here once they reach the Donor Pass step
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Driver Detail Panel */}
      <DriverDetailPanel
        driverId={selectedDriverId}
        open={!!selectedDriverId}
        onOpenChange={(open) => {
          if (!open) setSelectedDriverId(null);
        }}
      />
    </AppLayout>
  );
}
