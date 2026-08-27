import { useTranslation } from 'react-i18next';
import { EmptyState } from 'src/components/common/EmptyState';

/**
 * Common route — reachable by every role (`roles: 'all'` in
 * `src/routes/ProtectedRoutes.tsx`'s `COMMON_PROTECTED_ROUTES`), one shared
 * page rather than a copy per role.
 */
export function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('NAV_PROFILE')}</h1>
      <EmptyState title={t('PROFILE_EMPTY_TITLE')} description={t('PROFILE_EMPTY_BODY')} />
    </div>
  );
}
