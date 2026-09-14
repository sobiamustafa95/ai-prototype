import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { useResetPassword } from 'src/hooks/auth/useAuth';
import { toast } from 'src/stores/toastStore';
import { resetPasswordSchema, type ResetPasswordValues } from 'src/schemas/auth/auth.schema';

interface ResetPasswordFormProps {
  /** Single-use reset token from the OTP-verify step or the emailed reset link. */
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  const resetPassword = useResetPassword();

  // Action-handler: runs the mutation. No trigger-handler needed here — the
  // form's own `onSubmit` is the only entry point (AGENTS.md § Component
  // Conventions).
  function handleResetPassword(values: ResetPasswordValues) {
    resetPassword.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          toast.success(t('SUCCESS'));
          void navigate('/login', { replace: true });
        },
      }
    );
  }

  const onSubmit = handleSubmit(handleResetPassword);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
    >
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
      {resetPassword.isError ? (
        <p role="alert" className="text-danger text-sm">
          {resetPassword.error instanceof Error ? resetPassword.error.message : t('ERROR')}
        </p>
      ) : null}
      <Button type="submit" disabled={resetPassword.isPending}>
        {t('BUTTON_RESET_PASSWORD')}
      </Button>
    </form>
  );
}
