import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { Button } from 'src/components/common/Button';
import { authService } from 'src/services/authService';
import { forgotPasswordSchema, type ForgotPasswordValues } from 'src/schemas/auth.schema';

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const forgotPassword = useMutation({
    mutationFn: (values: ForgotPasswordValues) => authService.forgotPassword(values),
    meta: { skipErrorToast: true },
    onSuccess: (_data, variables) => {
      void navigate('/reset-password', { state: { email: variables.email } });
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void handleSubmit((values) => forgotPassword.mutateAsync(values))(event);
      }}
      noValidate
    >
      <Input
        label={t('LABEL_EMAIL')}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {forgotPassword.isError && (
        <p role="alert" className="text-danger text-sm">
          {forgotPassword.error instanceof Error ? forgotPassword.error.message : t('ERROR')}
        </p>
      )}
      <Button type="submit" disabled={forgotPassword.isPending}>
        {t('BUTTON_SEND_CODE')}
      </Button>
    </form>
  );
}
