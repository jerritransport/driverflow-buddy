import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, HardDrive, Users, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function SystemHealth() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const [driversResult, sapsResult, clinicsResult, docsResult] = await Promise.all([
        supabase.from('drivers').select('id', { count: 'exact', head: true }),
        supabase.from('saps').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
      ]);

      return {
        drivers: driversResult.count || 0,
        saps: sapsResult.count || 0,
        clinics: clinicsResult.count || 0,
        documents: docsResult.count || 0,
      };
    },
  });

  const healthItems = [
    { label: 'Total Drivers', value: stats?.drivers, icon: Users, color: 'text-blue-500' },
    { label: 'Active SAPs', value: stats?.saps, icon: Users, color: 'text-green-500' },
    { label: 'Clinics', value: stats?.clinics, icon: HardDrive, color: 'text-purple-500' },
    { label: 'Documents', value: stats?.documents, icon: FileText, color: 'text-orange-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Database statistics and system status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {healthItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <item.icon className={`h-8 w-8 ${item.color}`} />
              <div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{item.value?.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-primary/10 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            All systems operational
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
