import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { OtpForm } from 'src/components/auth/OtpForm';
import { useForgotPassword, useVerifyForgotPasswordOtp } from 'src/hooks/auth/useAuth';

interface LocationState {
  email?: string;
}

/** Verifying the forgot-password OTP returns a single-use reset token, not a session. */
export function VerifyForgotPasswordOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState | null)?.email;
  const { t } = useTranslation();
  const verifyOtp = useVerifyForgotPasswordOtp();
  // Resending is the same call as the initial "forgot password" submit.
  const resend = useForgotPassword();

  // No email in state means this route was hit directly, not via forgot-password
  // — send the user back to start the flow properly instead of a broken form.
  if (!email) return <Navigate to="/forgot-password" replace />;

  // Action-handler: runs the verify mutation. No trigger-handler needed here
  // — `OtpForm`'s own submit is the only entry point (AGENTS.md § Component
  // Conventions). A `const` arrow function, not a hoisted `function`
  // declaration, so `email`'s narrowing from the guard above (string |
  // undefined → string) actually applies inside its body.
  const handleVerify = async (otp: string) => {
    const { resetToken } = await verifyOtp.mutateAsync({ email, otp });
    void navigate('/reset-password', { state: { resetToken } });
  };

  // Action-handler: runs the resend mutation, wired to `OtpForm`'s own resend
  // button. Same `const` arrow reasoning as `handleVerify` above.
  const handleResend = () => resend.mutateAsync({ email });

  return (
    <>
      <Seo title={t('AUTH_OTP_TITLE')} />
      <h2 className="text-foreground mb-2 text-center text-lg font-semibold">
        {t('AUTH_OTP_TITLE')}
      </h2>
      <p className="text-foreground-muted mb-4 text-center text-sm">{t('AUTH_OTP_BODY')}</p>
      <OtpForm email={email} onVerify={handleVerify} onResend={handleResend} />
    </>
  );
}
