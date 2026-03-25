import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUnmatchedPayments, useMatchPayment, useMergePayments } from '@/hooks/useUnmatchedPayments';
import { useDrivers } from '@/hooks/useDrivers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserPlus, Merge, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function UnmatchedPayments() {
  const { data: payments, isLoading } = useUnmatchedPayments('unmatched');
  const matchPayment = useMatchPayment();
  const mergePayments = useMergePayments();
  const { toast } = useToast();
  const { user } = useAuth();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [driverSearch, setDriverSearch] = useState('');

  const { data: drivers } = useDrivers({ search: driverSearch, limit: 20 });

  const handleAssign = async (driverId: string) => {
    if (!selectedPaymentId || !user?.id) return;
    try {
      await matchPayment.mutateAsync({ paymentId: selectedPaymentId, driverId, userId: user.id });
      toast({ title: 'Payment Matched', description: 'Payment has been assigned to the driver.' });
      setAssignDialogOpen(false);
      setSelectedPaymentId(null);
      setDriverSearch('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleMerge = async () => {
    if (!mergeSourceId || !mergeTargetId) return;
    try {
      await mergePayments.mutateAsync({ sourceId: mergeSourceId, targetId: mergeTargetId });
      toast({ title: 'Payments Merged', description: 'Payments have been combined.' });
      setMergeDialogOpen(false);
      setMergeSourceId(null);
      setMergeTargetId(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unmatched Payments</h1>
          <p className="text-muted-foreground">Review and assign Stripe payments to drivers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Unmatched Payments ({payments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !payments?.length ? (
              <p className="py-8 text-center text-muted-foreground">No unmatched payments.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Stripe ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.payer_name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.payer_email || '—'}</TableCell>
                      <TableCell className="font-medium">${(payment.amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.payment_date ? format(new Date(payment.payment_date), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {payment.stripe_payment_id ? payment.stripe_payment_id.slice(0, 16) + '...' : '—'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[hsl(var(--status-warning))]/20 text-[hsl(var(--status-warning))]">
                          Unmatched
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPaymentId(payment.id);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-1 h-3 w-3" />
                            Assign
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMergeSourceId(payment.id);
                              setMergeDialogOpen(true);
                            }}
                          >
                            <Merge className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign to Driver Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Payment to Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {drivers?.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleAssign(driver.id)}
                  className="w-full rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
                  disabled={matchPayment.isPending}
                >
                  <p className="font-medium">{driver.first_name} {driver.last_name}</p>
                  <p className="text-xs text-muted-foreground">{driver.email} · {driver.phone}</p>
                </button>
              ))}
              {driverSearch && (!drivers || drivers.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">No drivers found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge with Another Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select another unmatched payment to merge with. The amounts will be combined.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {payments?.filter(p => p.id !== mergeSourceId).map((payment) => (
                <button
                  key={payment.id}
                  onClick={() => setMergeTargetId(payment.id)}
                  className={`w-full rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors ${
                    mergeTargetId === payment.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <p className="font-medium">{payment.payer_name || 'Unknown'} — ${(payment.amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{payment.payer_email}</p>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMerge} disabled={!mergeTargetId || mergePayments.isPending}>
              {mergePayments.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Merge Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
