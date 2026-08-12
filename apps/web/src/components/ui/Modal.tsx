'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Accessible modal overlay (Phase 5). Follows the existing inline-overlay
 * pattern used by CreateInvestigationDialog/EvidenceCreateDialog but extracted
 * so evidence/report/collaboration workspaces share it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'panel max-h-[90vh] w-full overflow-y-auto p-5',
          wide ? 'max-w-3xl' : 'max-w-lg',
          className,
        )}
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="panel-title">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-slate-tech hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
