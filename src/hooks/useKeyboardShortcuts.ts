import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  onSearch?: () => void;
  onAddNew?: () => void;
  onExport?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { onSearch, onAddNew, onExport } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const isCtrlOrMeta = event.ctrlKey || event.metaKey;

    // Global shortcuts
    if (isCtrlOrMeta && event.key === 'k') {
      event.preventDefault();
      onSearch?.();
      return;
    }

    // Ctrl+N / Cmd+N - Add new (context-dependent)
    if (isCtrlOrMeta && event.key === 'n') {
      event.preventDefault();
      onAddNew?.();
      return;
    }

    // Ctrl+E / Cmd+E - Export (context-dependent)
    if (isCtrlOrMeta && event.key === 'e') {
      event.preventDefault();
      onExport?.();
      return;
    }

    // Navigation shortcuts (g + key)
    if (event.key === 'g') {
      // Wait for the next key
      const handleNavKey = (e: KeyboardEvent) => {
        document.removeEventListener('keydown', handleNavKey);
        
        switch (e.key) {
          case 'd':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case 'r':
            e.preventDefault();
            navigate('/drivers');
            break;
          case 's':
            e.preventDefault();
            navigate('/saps');
            break;
          case 'c':
            e.preventDefault();
            navigate('/clinics');
            break;
          case 'a':
            e.preventDefault();
            navigate('/admin');
            break;
          case 'p':
            e.preventDefault();
            navigate('/profile');
            break;
        }
      };

      // Set a timeout to clear the listener
      const timeout = setTimeout(() => {
        document.removeEventListener('keydown', handleNavKey);
      }, 1000);

      document.addEventListener('keydown', handleNavKey);
      return () => clearTimeout(timeout);
    }

    // Escape - Close modals/panels (handled by individual components)
  }, [navigate, onSearch, onAddNew, onExport]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return available shortcuts for display in help modal
  const shortcuts: KeyboardShortcut[] = [
    { key: 'K', ctrl: true, action: () => {}, description: 'Open search' },
    { key: 'N', ctrl: true, action: () => {}, description: 'Add new item' },
    { key: 'E', ctrl: true, action: () => {}, description: 'Export data' },
    { key: 'G then D', action: () => {}, description: 'Go to Dashboard' },
    { key: 'G then R', action: () => {}, description: 'Go to Drivers' },
    { key: 'G then S', action: () => {}, description: 'Go to SAPs' },
    { key: 'G then C', action: () => {}, description: 'Go to Clinics' },
    { key: 'G then A', action: () => {}, description: 'Go to Admin' },
    { key: 'G then P', action: () => {}, description: 'Go to Profile' },
  ];

  return { shortcuts };
}
