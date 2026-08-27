import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { authService } from 'src/services/authService';
import { signupSchema, type SignupValues } from 'src/schemas/auth.schema';

export function SignupForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const signup = useMutation({
    mutationFn: (values: SignupValues) => authService.signup(values),
    // The form shows the error inline; skip the global toast for this one.
    meta: { skipErrorToast: true },
    onSuccess: (_data, variables) => {
      void navigate('/verify-signup-otp', { state: { email: variables.email } });
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        // .catch(() => {}) — the global onError (queryClient.ts) already
        // handles/would-toast the error; signup.isError below renders it
        // inline. Without this, a rejected mutateAsync surfaces as an
        // unhandled promise rejection (AGENTS.md § Data & State).
        void handleSubmit((values) => signup.mutateAsync(values).catch(() => {}))(event);
      }}
      noValidate
    >
      <Input
        label={t('LABEL_NAME')}
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label={t('LABEL_EMAIL')}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t('LABEL_PHONE')}
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <PasswordInput
        label={t('LABEL_PASSWORD')}
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
      {signup.isError && (
        <p role="alert" className="text-danger text-sm">
          {signup.error instanceof Error ? signup.error.message : t('ERROR')}
        </p>
      )}
      <Button type="submit" disabled={signup.isPending}>
        {t('BUTTON_SIGNUP')}
      </Button>
    </form>
  );
}
