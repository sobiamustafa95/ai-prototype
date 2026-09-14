import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { OtpForm } from 'src/components/auth/OtpForm';
import { useResendSignupOtp, useVerifyOtp } from 'src/hooks/auth/useAuth';
import { getHomeRouteForRole } from 'src/routes/ProtectedRoutes';

interface LocationState {
  email?: string;
}

/** Completes signup: verifying the OTP activates the account and starts a session. */
export function VerifySignupOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState | null)?.email;
  const { t } = useTranslation();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendSignupOtp();

  // No email in state means this route was hit directly, not via signup — send
  // the user back to start the flow properly instead of rendering a broken form.
  if (!email) return <Navigate to="/signup" replace />;

  // Action-handler: runs the verify mutation. No trigger-handler needed here
  // — `OtpForm`'s own submit is the only entry point (AGENTS.md § Component
  // Conventions). useVerifyOtp's own onSuccess already sets the session
  // (src/hooks/auth/useAuth.ts). A `const` arrow function, not a hoisted
  // `function` declaration, so `email`'s narrowing from the guard above
  // (string | undefined → string) actually applies inside its body.
  const handleVerify = async (otp: string) => {
    const { user } = await verifyOtp.mutateAsync({ email, otp });
    void navigate(getHomeRouteForRole(user.role), { replace: true });
  };

  // Action-handler: runs the resend mutation, wired to `OtpForm`'s own resend
  // button. Same `const` arrow reasoning as `handleVerify` above.
  const handleResend = () => resendOtp.mutateAsync({ email });

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
