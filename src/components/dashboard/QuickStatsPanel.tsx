import { DriverStatusOverview } from './DriverStatusOverview';
import { UpcomingFollowUps } from './UpcomingFollowUps';

export function QuickStatsPanel() {
  return (
    <div className="space-y-4">
      <DriverStatusOverview />
      <UpcomingFollowUps />
    </div>
  );
}
