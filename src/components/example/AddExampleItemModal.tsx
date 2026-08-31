import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTrigger } from 'src/components/common/Dialog';
import { Button } from 'src/components/common/Button';
import { exampleItemInputSchema, type ExampleItemInput } from 'src/schemas/example.schema';
import { useCreateExampleItem } from 'src/hooks/common/useCreateExampleItem';
import { ExampleItemFormFields } from 'src/components/example/ExampleItemFormFields';

/**
 * Create piece of the CRUD reference (AGENTS.md § Data & State's Mutations pattern —
 * see src/hooks/common/useCreateExampleItem.ts). The call-site `mutate(...)`'s own `onSuccess` owns the
 * UI effect (reset the form, close the modal); the hook's own `onSuccess` already
 * owns the toast + cache invalidation — never mixed into this one.
 */
export function AddExampleItemModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExampleItemInput>({ resolver: zodResolver(exampleItemInputSchema) });
  const createItem = useCreateExampleItem();

  const onSubmit = handleSubmit((values) => {
    createItem.mutate(values, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">{t('BUTTON_ADD')}</Button>
      </DialogTrigger>
      <DialogContent dialogTitle={t('EXAMPLE_ADD_TITLE')}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          noValidate
        >
          <ExampleItemFormFields register={register} errors={errors} />
          {createItem.isError ? (
            <p role="alert" className="text-danger text-sm">
              {t('ERROR')}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={createItem.isPending}>
              {t('BUTTON_SAVE')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
