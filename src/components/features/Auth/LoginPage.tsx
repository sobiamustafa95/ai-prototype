import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { LoginForm } from 'src/components/features/Auth/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('AUTH_LOGIN_TITLE')} />
      <h2 className="text-foreground mb-4 text-center text-lg font-semibold">
        {t('AUTH_LOGIN_TITLE')}
      </h2>
      <LoginForm />
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <Link to="/forgot-password" className="text-brand-600 font-medium">
          {t('LINK_FORGOT_PASSWORD')}
        </Link>
        <Link to="/signup" className="text-foreground-muted">
          {t('LINK_NO_ACCOUNT')}
        </Link>
      </div>
    </>
  );
}
