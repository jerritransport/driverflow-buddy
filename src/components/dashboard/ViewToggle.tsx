import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'kanban';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-card p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('table')}
        className={cn(
          'h-8 px-3',
          value === 'table' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <List className="mr-2 h-4 w-4" />
        Table
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('kanban')}
        className={cn(
          'h-8 px-3',
          value === 'kanban' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        Kanban
      </Button>
    </div>
  );
}

export function useViewMode(defaultMode: ViewMode = 'table') {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  return { mode, setMode };
}

export type { ViewMode };
