'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: variant === 'destructive' ? '#fee2e2' : '#f0fdfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 0 12px',
              fontSize: '1.3rem',
            }}
          >
            {variant === 'destructive' ? '🗑️' : '✅'}
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogFooter style={{ marginTop: 20 }}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            style={{ minWidth: 100 }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            style={{
              minWidth: 120,
              background: variant === 'destructive' ? '#ef4444' : '#00C2A8',
              color: '#fff',
              border: 'none',
            }}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
