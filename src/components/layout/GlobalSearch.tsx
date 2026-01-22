import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { User, Building2, Stethoscope, Search, Loader2 } from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  driver: User,
  sap: Stethoscope,
  clinic: Building2,
};

const typeLabels = {
  driver: 'Drivers',
  sap: 'SAPs',
  clinic: 'Clinics',
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { drivers, saps, clinics, isLoading, hasResults, isReady } = useGlobalSearch(query);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = useCallback((result: SearchResult) => {
    onOpenChange(false);
    
    switch (result.type) {
      case 'driver':
        navigate(`/drivers?selected=${result.id}`);
        break;
      case 'sap':
        navigate(`/saps?selected=${result.id}`);
        break;
      case 'clinic':
        navigate(`/clinics?selected=${result.id}`);
        break;
    }
  }, [navigate, onOpenChange]);

  const renderResultItem = (result: SearchResult) => {
    const Icon = typeIcons[result.type];
    
    return (
      <CommandItem
        key={`${result.type}-${result.id}`}
        value={`${result.type}-${result.id}-${result.title}`}
        onSelect={() => handleSelect(result)}
        className="flex items-center gap-3 py-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-medium truncate">{result.title}</span>
          <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
        </div>
        {result.metadata && (
          <span className="text-xs text-muted-foreground shrink-0">{result.metadata}</span>
        )}
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search drivers, SAPs, clinics..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!isReady && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>Type at least 2 characters to search</p>
          </div>
        )}

        {isReady && isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
            <p>Searching...</p>
          </div>
        )}

        {isReady && !isLoading && !hasResults && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {isReady && !isLoading && hasResults && (
          <>
            {drivers.length > 0 && (
              <CommandGroup heading={typeLabels.driver}>
                {drivers.map(renderResultItem)}
              </CommandGroup>
            )}

            {drivers.length > 0 && (saps.length > 0 || clinics.length > 0) && (
              <CommandSeparator />
            )}

            {saps.length > 0 && (
              <CommandGroup heading={typeLabels.sap}>
                {saps.map(renderResultItem)}
              </CommandGroup>
            )}

            {saps.length > 0 && clinics.length > 0 && <CommandSeparator />}

            {clinics.length > 0 && (
              <CommandGroup heading={typeLabels.clinic}>
                {clinics.map(renderResultItem)}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
