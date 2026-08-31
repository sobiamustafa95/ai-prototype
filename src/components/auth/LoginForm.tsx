import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from 'src/components/common/Input';
import { PasswordInput } from 'src/components/common/PasswordInput';
import { Button } from 'src/components/common/Button';
import { useLogin } from 'src/hooks/auth/useAuth';
import { loginSchema, type LoginValues } from 'src/schemas/auth.schema';
import { getHomeRouteForRole } from 'src/routes/ProtectedRoutes';

interface LocationState {
  from?: { pathname: string };
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        void handleSubmit((values) => {
          login.mutate(values, {
            onSuccess: ({ user }) => {
              const from = (location.state as LocationState | null)?.from?.pathname;
              void navigate(from ?? getHomeRouteForRole(user.role), { replace: true });
            },
          });
        })(event);
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
      {login.isError ? (
        <p role="alert" className="text-danger text-sm">
          {login.error instanceof Error ? login.error.message : t('ERROR')}
        </p>
      ) : null}
      <Button type="submit" disabled={login.isPending}>
        {t('BUTTON_LOGIN')}
      </Button>
    </form>
  );
}
