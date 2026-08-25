import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { SignupForm } from 'src/components/features/Auth/SignupForm';

export function SignupPage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('AUTH_SIGNUP_TITLE')} />
      <h2 className="text-foreground mb-4 text-center text-lg font-semibold">
        {t('AUTH_SIGNUP_TITLE')}
      </h2>
      <SignupForm />
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-brand-600 font-medium">
          {t('LINK_HAVE_ACCOUNT')}
        </Link>
      </p>
    </>
  );
}
