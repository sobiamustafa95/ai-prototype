import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTrigger } from 'src/components/common/Dialog';
import { Button } from 'src/components/common/Button';

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Destructive/blocking-action confirmation, built on the common `Dialog`. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent dialogTitle={title}>
        {description && <p className="text-foreground-muted mb-4 text-sm">{description}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange?.(false)}>
            {cancelLabel ?? t('BUTTON_CANCEL')}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel ?? t('BUTTON_CONFIRM')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
