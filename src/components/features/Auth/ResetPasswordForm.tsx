import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { authService } from 'src/services/authService';
import { toast } from 'src/stores/toastStore';
import { resetPasswordSchema, type ResetPasswordValues } from 'src/schemas/auth.schema';

interface ResetPasswordFormProps {
  /** Pre-fills the email field when arriving from ForgotPasswordPage's redirect. */
  defaultEmail?: string;
}

export function ResetPasswordForm({ defaultEmail }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: defaultEmail ?? '' },
  });

  const resetPassword = useMutation({
    mutationFn: (values: ResetPasswordValues) => authService.resetPassword(values),
    meta: { skipErrorToast: true },
    onSuccess: () => {
      toast.success(t('SUCCESS'));
      void navigate('/login', { replace: true });
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void handleSubmit((values) => resetPassword.mutateAsync(values))(event);
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
      <Input
        label={t('LABEL_OTP_CODE')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...register('code')}
      />
      <PasswordInput
        label={t('LABEL_NEW_PASSWORD')}
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        label={t('LABEL_CONFIRM_PASSWORD')}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {resetPassword.isError && (
        <p role="alert" className="text-danger text-sm">
          {resetPassword.error instanceof Error ? resetPassword.error.message : t('ERROR')}
        </p>
      )}
      <Button type="submit" disabled={resetPassword.isPending}>
        {t('BUTTON_RESET_PASSWORD')}
      </Button>
    </form>
  );
}
