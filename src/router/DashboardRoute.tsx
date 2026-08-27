import { useTranslation } from 'react-i18next';
import { Can } from 'src/components/common/Can';
import { EmptyState } from 'src/components/common/EmptyState';

/**
 * Placeholder protected route — demonstrates the intended pattern (EmptyState
 * for "nothing here yet", `Can` for inline role-gated UI) for the first real
 * feature to replace. Wired under DashboardLayout + RequireAuth in router.tsx.
 */
export function DashboardRoute() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('NAV_DASHBOARD')}</h1>
      <EmptyState title={t('DASHBOARD_EMPTY_TITLE')} description={t('DASHBOARD_EMPTY_BODY')} />
      <Can allowedRoles={['admin']}>
        <p className="text-foreground-muted text-sm">{t('DASHBOARD_ADMIN_ONLY_NOTE')}</p>
      </Can>
    </div>
  );
}
