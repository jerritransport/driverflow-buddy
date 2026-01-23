import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { category: 'Search & Actions', items: [
    { keys: ['⌘', 'K'], description: 'Open global search' },
    { keys: ['⌘', 'N'], description: 'Add new item (context-dependent)' },
    { keys: ['⌘', 'E'], description: 'Export data (context-dependent)' },
  ]},
  { category: 'Navigation', items: [
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'R'], description: 'Go to Drivers' },
    { keys: ['G', 'S'], description: 'Go to SAPs' },
    { keys: ['G', 'C'], description: 'Go to Clinics' },
    { keys: ['G', 'A'], description: 'Go to Admin' },
    { keys: ['G', 'P'], description: 'Go to Profile' },
  ]},
  { category: 'General', items: [
    { keys: ['Esc'], description: 'Close dialog/panel' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ]},
];

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border bg-background px-1.5 font-mono text-xs font-medium shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
