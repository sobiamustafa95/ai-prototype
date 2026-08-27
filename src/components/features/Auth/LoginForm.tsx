import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { useAuthStore } from 'src/stores/authStore';
import { loginSchema, type LoginValues } from 'src/schemas/auth.schema';

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status === 'authenticated') void navigate('/dashboard', { replace: true });
  }, [status, navigate]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void handleSubmit((values) => login(values))(event);
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
      <PasswordInput
        label={t('LABEL_PASSWORD')}
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === 'authenticating'}>
        {t('BUTTON_LOGIN')}
      </Button>
    </form>
  );
}
