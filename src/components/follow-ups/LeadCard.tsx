import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/hooks/useLeads';
import { useStaffMembers } from '@/hooks/useStaffMembers';
import { toProperCase } from '@/lib/utils';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { Phone, User, Trash2, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onDelete: (leadId: string) => void;
}

export function LeadCard({ lead, onDelete }: LeadCardProps) {
  const { data: staffMembers } = useStaffMembers();
  const agent = staffMembers?.find((s) => s.id === lead.staff_member_id);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {toProperCase(lead.first_name)} {toProperCase(lead.last_name)}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              {formatPhoneDisplay(lead.phone)}
            </div>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <UserCheck className="h-3 w-3" />
            Lead
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">SAP Counselor</span>
            <span className="font-medium">{lead.sap_counselor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Agent</span>
            <span className="flex items-center gap-1 font-medium">
              <User className="h-3 w-3" />
              {agent?.name ?? 'Unknown'}
            </span>
          </div>
          {lead.how_heard && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Heard about us</span>
              <span className="font-medium">{lead.how_heard}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Added</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(lead.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
