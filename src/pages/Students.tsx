import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTenants, useUpdateTenant, Tenant } from '@/hooks/useTenants';
import { StudentFormDialog } from '@/components/students/StudentFormDialog';
import { StudentDetailPanel } from '@/components/students/StudentDetailPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, Building2, Users, CheckCircle2, MoreHorizontal, Eye, Pencil, ShieldCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { useToast } from '@/hooks/use-toast';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const { data: tenants, isLoading } = useTenants();
  const updateTenant = useUpdateTenant();
  const { toast } = useToast();

  const pendingCount = tenants?.filter(t => !t.is_active).length ?? 0;

  const handleApprove = async (tenantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTenant.mutateAsync({ tenantId, updates: { is_active: true } });
      toast({ title: 'Student Approved', description: 'The student account has been activated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to approve.', variant: 'destructive' });
    }
  };

  const filtered = tenants?.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.company_name.toLowerCase().includes(q) ||
      t.contact_email.toLowerCase().includes(q)
    );
  });

  const totalTenants = tenants?.length ?? 0;
  const activeTenants = tenants?.filter(t => t.is_active).length ?? 0;
  const gmailConfigured = tenants?.filter(t => t.gmail_refresh_token).length ?? 0;
  const twilioConfigured = tenants?.filter(t => t.twilio_account_sid).length ?? 0;

  const handleAdd = () => {
    setEditingTenant(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (tenantId: string) => {
    const t = tenants?.find(x => x.id === tenantId);
    setEditingTenant(t ?? null);
    setFormDialogOpen(true);
  };

  const credBadge = (value: string | null, connectedLabel = 'Connected', notLabel = 'Not Configured') =>
    value ? (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs">{connectedLabel}</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">{notLabel}</Badge>
    );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage student CTPA businesses and their service credentials
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={Building2} label="Total Students" value={totalTenants} subtext={`${activeTenants} active`} />
          <SummaryCard icon={Users} label="Gmail Connected" value={gmailConfigured} />
          <SummaryCard icon={CheckCircle2} label="Twilio Configured" value={twilioConfigured} />
          <SummaryCard
            icon={CheckCircle2}
            label="CRL Configured"
            value={tenants?.filter(t => t.crl_login_email).length ?? 0}
          />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Gmail</TableHead>
                  <TableHead className="text-center">Twilio</TableHead>
                  <TableHead className="text-center">CRL</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filtered?.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTenantId(t.id)}
                    >
                      <TableCell>
                        <p className="font-medium">{t.company_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{t.contact_email}</p>
                        {t.contact_phone && (
                          <p className="text-xs text-muted-foreground">{formatPhoneDisplay(t.contact_phone)}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{credBadge(t.gmail_refresh_token)}</TableCell>
                      <TableCell className="text-center">{credBadge(t.twilio_account_sid)}</TableCell>
                      <TableCell className="text-center">{credBadge(t.crl_login_email)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={t.is_active ? 'default' : 'secondary'}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(t.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTenantId(t.id); }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(t.id); }}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Detail Panel */}
        <StudentDetailPanel
          tenantId={selectedTenantId}
          open={!!selectedTenantId}
          onOpenChange={(open) => !open && setSelectedTenantId(null)}
          onEdit={handleEdit}
        />

        {/* Add/Edit Dialog */}
        <StudentFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          tenant={editingTenant}
        />
      </div>
    </AppLayout>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subtext?: string;
}

function SummaryCard({ icon: Icon, label, value, subtext }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">
            {label}
            {subtext && <span className="ml-1">({subtext})</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
