import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TestResultCard } from '@/components/test-results/TestResultCard';
import { DriverDetailPanel } from '@/components/driver-detail';
import { useTestResults, TestResultFilter } from '@/hooks/useTestResults';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical, Search } from 'lucide-react';

export default function TestResults() {
  const [filter, setFilter] = useState<TestResultFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data: results, isLoading } = useTestResults({ filter, search });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FlaskConical className="h-6 w-6" />
            Test Results
          </h1>
          <p className="text-muted-foreground">
            View and download driver test results and documents
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as TestResultFilter)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or Sample ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <TestResultCard
                key={result.id}
                result={result}
                onViewDriver={setSelectedDriverId}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No test results found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'pending' && 'No pending test results'}
                {filter === 'completed' && 'No completed test results'}
                {filter === 'all' && 'Test results will appear here when drivers have samples collected'}
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
