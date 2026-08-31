import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from 'src/components/common/ConfirmDialog';
import { Button } from 'src/components/common/Button';
import type { ExampleItem } from 'src/schemas/example.schema';
import { useDeleteExampleItem } from 'src/hooks/common/useDeleteExampleItem';

interface DeleteExampleItemButtonProps {
  item: ExampleItem;
}

/**
 * Delete piece of the CRUD reference — `ConfirmDialog`'s (src/components/common/)
 * first real caller in this repo. Passes `open`/`onOpenChange` because *this*
 * caller specifically needs to close the dialog itself after the delete mutation
 * succeeds (Confirm deliberately never auto-closes — see `ConfirmDialog`'s own
 * `open` prop doc) — not because uncontrolled usage would otherwise be broken;
 * Cancel closes correctly either way via `ConfirmDialog`'s own `DialogClose`.
 */
export function DeleteExampleItemButton({ item }: DeleteExampleItemButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const deleteItem = useDeleteExampleItem();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="ghost" size="sm">
          {t('BUTTON_DELETE')}
        </Button>
      }
      title={t('EXAMPLE_DELETE_CONFIRM_TITLE')}
      description={t('EXAMPLE_DELETE_CONFIRM_BODY')}
      onConfirm={() => {
        deleteItem.mutate(item.id, {
          onSuccess: () => {
            setOpen(false);
          },
        });
      }}
    />
  );
}
