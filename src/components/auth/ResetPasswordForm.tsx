import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { authService } from 'src/services/authService';
import { toast } from 'src/stores/toastStore';
import { resetPasswordSchema, type ResetPasswordValues } from 'src/schemas/auth.schema';

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

  const resetPassword = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authService.verifyResetPassword({ token, password: values.password }),
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
        // .catch(() => {}) — the global onError already handles the error;
        // without it a rejected mutateAsync is an unhandled promise rejection
        // (AGENTS.md § Data & State).
        void handleSubmit((values) => resetPassword.mutateAsync(values).catch(() => {}))(event);
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
