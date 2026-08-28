import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { useAuthStore } from 'src/stores/authStore';
import { loginSchema, type LoginValues } from 'src/schemas/auth.schema';
import { getHomeRouteForRole } from 'src/routes/ProtectedRoutes';

interface LocationState {
  from?: { pathname: string };
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const role = useAuthStore((state) => state.user?.role);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status !== 'authenticated') return;
    const from = (location.state as LocationState | null)?.from?.pathname;
    void navigate(from ?? getHomeRouteForRole(role), { replace: true });
  }, [status, navigate, location.state, role]);

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
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={status === 'authenticating'}>
        {t('BUTTON_LOGIN')}
      </Button>
    </form>
  );
}
