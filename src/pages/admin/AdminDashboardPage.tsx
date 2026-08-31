import { useTranslation } from 'react-i18next';
import { EmptyState } from 'src/components/common/EmptyState';

/**
 * `Role.ADMIN`'s own dashboard — same shape as the member role's
 * `DashboardPage`, proving the admin role renders end-to-end without inventing
 * a real admin feature. Registered in `src/routes/ProtectedRoutes.tsx`'s
 * `ADMIN_PROTECTED_ROUTES`, wired under `RoleLayout` + `RoleGuards` in
 * `AppRouters.tsx`.
 */
export function AdminDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('NAV_ADMIN_DASHBOARD')}</h1>
      <EmptyState
        title={t('ADMIN_DASHBOARD_EMPTY_TITLE')}
        description={t('ADMIN_DASHBOARD_EMPTY_BODY')}
      />
    </div>
  );
}
