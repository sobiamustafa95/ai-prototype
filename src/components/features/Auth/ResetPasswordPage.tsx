import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { ResetPasswordForm } from 'src/components/features/Auth/ResetPasswordForm';

interface LocationState {
  email?: string;
}

export function ResetPasswordPage() {
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('AUTH_RESET_PASSWORD_TITLE')} />
      <h2 className="text-foreground mb-4 text-center text-lg font-semibold">
        {t('AUTH_RESET_PASSWORD_TITLE')}
      </h2>
      <ResetPasswordForm defaultEmail={email} />
    </>
  );
}
