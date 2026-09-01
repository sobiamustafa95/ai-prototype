import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import type { ExampleItemInput } from 'src/schemas/common/example.schema';

interface ExampleItemFormFieldsProps {
  register: UseFormRegister<ExampleItemInput>;
  errors: FieldErrors<ExampleItemInput>;
}

/** Title/description fields shared by AddExampleItemModal and EditExampleItemModal. */
export function ExampleItemFormFields({ register, errors }: ExampleItemFormFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Input label={t('LABEL_TITLE')} error={errors.title?.message} {...register('title')} />
      <Input
        label={t('LABEL_DESCRIPTION')}
        error={errors.description?.message}
        {...register('description')}
      />
    </>
  );
}
