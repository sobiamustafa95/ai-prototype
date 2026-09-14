import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from 'src/components/common/Dialog';
import { Button } from 'src/components/common/Button';
import {
  exampleItemInputSchema,
  type ExampleItem,
  type ExampleItemInput,
} from 'src/schemas/common/example.schema';
import { useUpdateExampleItem } from 'src/hooks/common/useUpdateExampleItem';
import { ExampleItemFormFields } from 'src/components/example/ExampleItemFormFields';

interface EditExampleItemModalProps {
  /** `null` = closed. One instance in ExampleWidget, driven by its own `editingItem`
   *  state, rather than one modal per row. */
  item: ExampleItem | null;
  onOpenChange: (open: boolean) => void;
}

/** Edit piece of the CRUD reference — see src/hooks/common/useUpdateExampleItem.ts for the invalidation. */
export function EditExampleItemModal({ item, onOpenChange }: EditExampleItemModalProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExampleItemInput>({ resolver: zodResolver(exampleItemInputSchema) });
  const updateItem = useUpdateExampleItem();

  useEffect(() => {
    if (item) reset({ title: item.title, description: item.description });
  }, [item, reset]);

  // Action-handler: runs the mutation. The trigger-handler that opens this
  // modal (`handleEditClick`) lives in `ExampleWidget.tsx`, since this
  // component's own `open` state is driven entirely by the `item` prop it's
  // given, not by a trigger it renders itself.
  function handleUpdate(values: ExampleItemInput) {
    if (!item) return;
    updateItem.mutate(
      { id: item.id, ...values },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  const onSubmit = handleSubmit(handleUpdate);

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle={t('EXAMPLE_EDIT_TITLE')}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          noValidate
        >
          <ExampleItemFormFields register={register} errors={errors} />
          {updateItem.isError ? (
            <p role="alert" className="text-danger text-sm">
              {t('ERROR')}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={updateItem.isPending}>
              {t('BUTTON_SAVE')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
