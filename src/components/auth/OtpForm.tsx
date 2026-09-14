import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { Button } from 'src/components/common/Button';
import { toast } from 'src/stores/toastStore';
import { otpSchema, type OtpValues } from 'src/schemas/auth/auth.schema';

interface OtpFormProps {
  /** Shown as read-only context above the code field. */
  email: string;
  /** Verifies the code. Resolves/rejects — this form doesn't know what happens next. */
  onVerify: (otp: string) => Promise<void>;
  /** Requests a new code for the same email. */
  onResend: () => Promise<void>;
}

/**
 * Generic OTP-entry form, reused by both `VerifySignupOtpPage` (activates the
 * account) and `VerifyForgotPasswordOtpPage` (returns a password-reset token) —
 * which endpoint gets called, and what happens on success, is entirely up to
 * the `onVerify`/`onResend` callbacks the page supplies.
 */
export function OtpForm({ email, onVerify, onResend }: OtpFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  const verify = useMutation({
    mutationFn: (values: OtpValues) => onVerify(values.code),
    meta: { skipErrorToast: true },
  });

  const resend = useMutation({
    mutationFn: onResend,
    onSuccess: () => {
      toast.success(t('SUCCESS'));
    },
  });

  // Action-handler: runs the verify mutation. No trigger-handler needed here
  // — the form's own `onSubmit` is the only entry point (AGENTS.md §
  // Component Conventions). `.catch(() => {})` — the global onError already
  // handles the error; without it a rejected mutateAsync is an unhandled
  // promise rejection (AGENTS.md § Data & State).
  function handleVerify(values: OtpValues) {
    return verify.mutateAsync(values).catch(() => {});
  }

  // Action-handler: runs the resend mutation, wired to its own Button below.
  function handleResend() {
    resend.mutate();
  }

  const onSubmit = handleSubmit(handleVerify);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
    >
      <p className="text-foreground-muted text-sm">{email}</p>
      <Input
        label={t('LABEL_OTP_CODE')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...register('code')}
      />
      {verify.isError ? (
        <p role="alert" className="text-danger text-sm">
          {verify.error instanceof Error ? verify.error.message : t('ERROR')}
        </p>
      ) : null}
      <Button type="submit" disabled={verify.isPending}>
        {t('BUTTON_VERIFY')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={resend.isPending}
        onClick={handleResend}
      >
        {t('BUTTON_RESEND_CODE')}
      </Button>
    </form>
  );
}
