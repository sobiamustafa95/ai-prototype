import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { OtpForm } from 'src/components/features/Auth/OtpForm';

interface LocationState {
  email?: string;
}

export function VerifyOtpPage() {
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;
  const { t } = useTranslation();

  // No email in state means this route was hit directly, not via signup — send
  // the user back to start the flow properly instead of rendering a broken form.
  if (!email) return <Navigate to="/signup" replace />;

  return (
    <>
      <Seo title={t('AUTH_OTP_TITLE')} />
      <h2 className="text-foreground mb-2 text-center text-lg font-semibold">
        {t('AUTH_OTP_TITLE')}
      </h2>
      <p className="text-foreground-muted mb-4 text-center text-sm">{t('AUTH_OTP_BODY')}</p>
      <OtpForm email={email} />
    </>
  );
}
