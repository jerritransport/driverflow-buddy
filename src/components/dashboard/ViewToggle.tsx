import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ViewMode = 'table' | 'kanban';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border-2 border-primary/20 bg-card p-1 shadow-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('table')}
            className={cn(
              'h-9 px-4 gap-2',
              value === 'table' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Table View</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('kanban')}
            className={cn(
              'h-9 px-4 gap-2',
              value === 'kanban' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Kanban Board</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function useViewMode(defaultMode: ViewMode = 'table') {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  return { mode, setMode };
}

export type { ViewMode };
