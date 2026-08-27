import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { ForgotPasswordForm } from 'src/components/auth/ForgotPasswordForm';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('AUTH_FORGOT_PASSWORD_TITLE')} />
      <h2 className="text-foreground mb-2 text-center text-lg font-semibold">
        {t('AUTH_FORGOT_PASSWORD_TITLE')}
      </h2>
      <p className="text-foreground-muted mb-4 text-center text-sm">
        {t('AUTH_FORGOT_PASSWORD_BODY')}
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-brand-600 font-medium">
          {t('LINK_BACK_TO_LOGIN')}
        </Link>
      </p>
    </>
  );
}
