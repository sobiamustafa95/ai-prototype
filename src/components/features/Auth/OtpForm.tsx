import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { Button } from 'src/components/common/Button';
import { authService } from 'src/services/authService';
import { useAuthStore } from 'src/stores/authStore';
import { toast } from 'src/stores/toastStore';
import { otpSchema, type OtpValues } from 'src/schemas/auth.schema';

interface OtpFormProps {
  email: string;
}

/** Verifies the emailed code and completes signup by starting a session. */
export function OtpForm({ email }: OtpFormProps) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  const verify = useMutation({
    mutationFn: (values: OtpValues) => authService.verifyOtp({ email, code: values.code }),
    meta: { skipErrorToast: true },
    onSuccess: ({ user, token }) => {
      setSession(user, token);
      void navigate('/dashboard', { replace: true });
    },
  });

  const resend = useMutation({
    mutationFn: () => authService.resendOtp({ email }),
    onSuccess: () => toast.success(t('SUCCESS')),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void handleSubmit((values) => verify.mutateAsync(values))(event);
      }}
      noValidate
    >
      <Input
        label={t('LABEL_OTP_CODE')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...register('code')}
      />
      {verify.isError && (
        <p role="alert" className="text-danger text-sm">
          {verify.error instanceof Error ? verify.error.message : t('ERROR')}
        </p>
      )}
      <Button type="submit" disabled={verify.isPending}>
        {t('BUTTON_VERIFY')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={resend.isPending}
        onClick={() => resend.mutate()}
      >
        {t('BUTTON_RESEND_CODE')}
      </Button>
    </form>
  );
}
