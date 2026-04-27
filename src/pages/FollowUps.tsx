import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FollowUpCard } from '@/components/follow-ups/FollowUpCard';
import { SetFollowUpDialog } from '@/components/driver-detail/SetFollowUpDialog';
import { DriverDetailPanel } from '@/components/driver-detail';
import { useFollowUps, useFollowUpStats, useClearFollowUp, FollowUpFilter } from '@/hooks/useFollowUps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Search, AlertTriangle, Clock, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function FollowUps() {
  const [filter, setFilter] = useState<FollowUpFilter>('today');
  const [search, setSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [rescheduleDriverId, setRescheduleDriverId] = useState<string | null>(null);

  const { data: followUps, isLoading } = useFollowUps({ filter, search });
  const { data: stats, isLoading: statsLoading } = useFollowUpStats();
  const clearFollowUp = useClearFollowUp();

  const handleComplete = async (driverId: string) => {
    try {
      await clearFollowUp.mutateAsync(driverId);
      toast.success('Follow-up marked as complete');
    } catch {
      toast.error('Failed to complete follow-up');
    }
  };

  const handleReschedule = (driverId: string) => {
    setRescheduleDriverId(driverId);
  };

  const handleView = (driverId: string) => {
    setSelectedDriverId(driverId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Calendar className="h-6 w-6" />
            Follow-Ups
          </h1>
          <p className="text-muted-foreground">
            Manage driver follow-up reminders and tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            active={filter === 'today'}
            onClick={() => setFilter('today')}
            iconBg="bg-[hsl(var(--status-warning))]/10"
            icon={<Clock className="h-5 w-5 text-[hsl(var(--status-warning))]" />}
            label="Due Today"
            value={stats?.dueToday ?? 0}
            loading={statsLoading}
          />
          <StatCard
            active={filter === 'overdue'}
            onClick={() => setFilter('overdue')}
            iconBg="bg-destructive/10"
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            label="Overdue"
            value={stats?.overdue ?? 0}
            loading={statsLoading}
            valueClassName="text-destructive"
          />
          <StatCard
            active={filter === 'upcoming'}
            onClick={() => setFilter('upcoming')}
            iconBg="bg-primary/10"
            icon={<CalendarCheck className="h-5 w-5 text-primary" />}
            label="This Week"
            value={stats?.thisWeek ?? 0}
            loading={statsLoading}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FollowUpFilter)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="today">Due Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Follow-up Cards Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : followUps && followUps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {followUps.map((driver) => (
              <FollowUpCard
                key={driver.id}
                driver={driver}
                onComplete={handleComplete}
                onReschedule={handleReschedule}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No follow-ups found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'today' && 'No follow-ups due today'}
                {filter === 'upcoming' && 'No upcoming follow-ups scheduled'}
                {filter === 'overdue' && 'Great! No overdue follow-ups'}
                {filter === 'all' && 'Set follow-ups from the driver detail panel'}
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

      {/* Reschedule Dialog */}
      <SetFollowUpDialog
        driverId={rescheduleDriverId ?? ''}
        open={!!rescheduleDriverId}
        onOpenChange={(open) => {
          if (!open) setRescheduleDriverId(null);
        }}
      />
    </AppLayout>
  );
}

interface StatCardProps {
  active?: boolean;
  onClick?: () => void;
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
  valueClassName?: string;
}

function StatCard({ active, onClick, iconBg, icon, label, value, loading, valueClassName }: StatCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${iconBg} p-2`}>{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-8" />
            ) : (
              <p className={`text-2xl font-bold ${valueClassName ?? ''}`}>{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
