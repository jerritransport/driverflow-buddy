import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Mail, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface FollowUpDriver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  follow_up_date: string;
}

// Generate a consistent color based on initials
function getAvatarColor(initials: string): string {
  const colors = [
    'bg-primary',
    'bg-[hsl(var(--status-success))]',
    'bg-[hsl(var(--status-warning))]',
    'bg-[hsl(var(--status-info))]',
    'bg-violet-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
}

export function UpcomingFollowUps() {
  const { data: followUps, isLoading } = useQuery({
    queryKey: ['upcoming-follow-ups'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('drivers')
        .select('id, first_name, last_name, email, phone, follow_up_date')
        .gte('follow_up_date', today)
        .order('follow_up_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as FollowUpDriver[];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Follow-Ups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!followUps || followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming follow-ups
          </p>
        ) : (
          followUps.map((driver) => (
            <FollowUpRow key={driver.id} driver={driver} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function FollowUpRow({ driver }: { driver: FollowUpDriver }) {
  const initials = `${driver.first_name.charAt(0)}${driver.last_name.charAt(0)}`.toUpperCase();
  const fullName = `${driver.first_name} ${driver.last_name}`;
  const avatarColor = getAvatarColor(initials);
  
  const formattedDate = driver.follow_up_date 
    ? format(parseISO(driver.follow_up_date), 'MMM d, yyyy')
    : 'No date';

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className={`${avatarColor} text-white text-xs font-medium`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fullName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          asChild
        >
          <a href={`mailto:${driver.email}`} title={`Email ${fullName}`}>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          asChild
        >
          <a href={`tel:${driver.phone}`} title={`Call ${fullName}`}>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </a>
        </Button>
      </div>
    </div>
  );
}
