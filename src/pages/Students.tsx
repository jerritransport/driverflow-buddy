import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { GraduationCap, Plus, Search, CheckCircle2, XCircle, Mail, Phone, Globe } from 'lucide-react';
import { useTenants, type Tenant } from '@/hooks/useTenants';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { StudentDetailPanel } from '@/components/students/StudentDetailPanel';

function CredentialIcon({ configured }: { configured: boolean }) {
  return configured
    ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-success))]" />
    : <XCircle className="h-4 w-4 text-muted-foreground/50" />;
}

export default function Students() {
  const { data: tenants, isLoading } = useTenants();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = (tenants || []).filter((t) =>
    t.company_name.toLowerCase().includes(search.toLowerCase()) ||
    t.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (tenant: Tenant) => {
    setSelectedId(tenant.id);
    setDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <GraduationCap className="h-6 w-6" />
              Student Management
            </h1>
            <p className="text-muted-foreground">
              Manage student CTPA tenants and their credential connections.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Students</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GraduationCap className="mb-2 h-10 w-10 opacity-30" />
                <p>No students found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1"><Mail className="h-3.5 w-3.5" /> Gmail</div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1"><Phone className="h-3.5 w-3.5" /> Twilio</div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1"><Globe className="h-3.5 w-3.5" /> CRL</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(tenant)}
                    >
                      <TableCell className="font-medium">{tenant.company_name}</TableCell>
                      <TableCell className="text-muted-foreground">{tenant.contact_email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tenant.is_active ? 'default' : 'secondary'}
                          className={tenant.is_active ? 'bg-[hsl(var(--status-success))] text-white' : ''}
                        >
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center"><CredentialIcon configured={!!tenant.gmail_address} /></TableCell>
                      <TableCell className="text-center"><CredentialIcon configured={!!tenant.twilio_account_sid} /></TableCell>
                      <TableCell className="text-center"><CredentialIcon configured={!!tenant.crl_login_email} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} />
      <StudentDetailPanel tenantId={selectedId} open={detailOpen} onOpenChange={setDetailOpen} />
    </AppLayout>
  );
}
