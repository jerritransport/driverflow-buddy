import { AppLayout } from '@/components/layout/AppLayout';
import {
  DriverTrendsChart,
  PaymentAnalyticsChart,
  StepDistributionChart,
  SapPerformanceChart,
} from '@/components/reports';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="h-6 w-6" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Analytics and performance metrics for the RTD process
          </p>
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Driver Trends - Full width on top */}
          <div className="lg:col-span-2">
            <DriverTrendsChart />
          </div>

          {/* Payment Analytics */}
          <div className="lg:col-span-2">
            <PaymentAnalyticsChart />
          </div>

          {/* Pipeline Distribution */}
          <StepDistributionChart />

          {/* SAP Performance */}
          <SapPerformanceChart />
        </div>
      </div>
    </AppLayout>
  );
}
