import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/hooks/useDrivers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  payment_type: z.enum(['deposit', 'balance', 'alcohol_fee', 'refund']),
  payment_method_type: z.enum(['CARD', 'CASH', 'CHECK', 'ACH', 'OTHER']).optional().default('CARD'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
}

const PAYMENT_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'balance', label: 'Balance Payment' },
  { value: 'alcohol_fee', label: 'Alcohol Test Fee' },
  { value: 'refund', label: 'Refund' },
];

const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Credit/Debit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'ACH', label: 'Bank Transfer (ACH)' },
  { value: 'OTHER', label: 'Other' },
];

export function RecordPaymentDialog({ open, onOpenChange, driver }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingBalance = (driver.amount_due ?? 0) - (driver.amount_paid ?? 0);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance > 0 ? remainingBalance.toFixed(2) : '',
      payment_type: 'balance',
      payment_method_type: 'CARD',
    },
  });

  const recordPayment = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const amount = parseFloat(data.amount);
      const isRefund = data.payment_type === 'refund';

      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        driver_id: driver.id,
        amount: isRefund ? -amount : amount,
        payment_type: data.payment_type,
        payment_method_type: data.payment_method_type,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      if (paymentError) throw paymentError;

      // Update driver's amount_paid
      const newAmountPaid = (driver.amount_paid ?? 0) + (isRefund ? -amount : amount);
      const isPaidInFull = newAmountPaid >= (driver.amount_due ?? 0);

      const { error: driverError } = await supabase
        .from('drivers')
        .update({
          amount_paid: newAmountPaid,
          payment_status: isPaidInFull ? 'PAID' : newAmountPaid > 0 ? 'PARTIAL' : 'UNPAID',
          payment_hold: isPaidInFull ? false : driver.payment_hold,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (driverError) throw driverError;

      return { amount, isRefund, isPaidInFull };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['driver-payments', driver.id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      toast.success(
        result.isRefund
          ? `Refund of $${result.amount.toFixed(2)} recorded`
          : `Payment of $${result.amount.toFixed(2)} recorded${result.isPaidInFull ? ' - Paid in Full!' : ''}`
      );

      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      await recordPayment.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for {driver.first_name} {driver.last_name}
          </DialogDescription>
        </DialogHeader>

        {/* Balance Summary */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Amount Due</p>
              <p className="text-lg font-semibold">${(driver.amount_due ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="text-lg font-semibold text-[hsl(var(--status-success))]">
                ${(driver.amount_paid ?? 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-lg font-semibold ${remainingBalance > 0 ? 'text-[hsl(var(--status-warning))]' : 'text-[hsl(var(--status-success))]'}`}>
                ${remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input {...field} type="number" step="0.01" min="0" className="pl-7" placeholder="0.00" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
