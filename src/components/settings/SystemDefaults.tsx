import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function SystemDefaults() {
  const { toast } = useToast();
  const [defaultFee, setDefaultFee] = useState('450.00');
  const [alcoholFee, setAlcoholFee] = useState('50.00');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save - in a real app this would update a system_settings table
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'System defaults have been updated.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          System Defaults
        </CardTitle>
        <CardDescription>
          Configure default values for new drivers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultFee">Default RTD Fee</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="defaultFee"
              type="number"
              step="0.01"
              min="0"
              value={defaultFee}
              onChange={(e) => setDefaultFee(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Default amount due for new driver registrations
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alcoholFee">Alcohol Test Fee</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="alcoholFee"
              type="number"
              step="0.01"
              min="0"
              value={alcoholFee}
              onChange={(e) => setAlcoholFee(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Additional fee when alcohol testing is required
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
