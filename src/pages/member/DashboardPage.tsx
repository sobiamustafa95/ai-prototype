import { useTranslation } from 'react-i18next';
import { Can } from 'src/components/common/Can';
import { EmptyState } from 'src/components/common/EmptyState';
import { Role } from 'src/routes/roles';

/**
 * `Role.MEMBER`'s own dashboard — demonstrates the intended pattern (EmptyState
 * for "nothing here yet", `Can` for inline role-gated UI *within* a shared page)
 * for the first real feature to replace. `Can` here is a different mechanism
 * than the route-level access check in `ProtectedRoutes.tsx`/`RoleGuards` that
 * decides whether a user can reach a route *at all* — this is "can this member
 * additionally see a bit of admin-only UI on their own page." Wired under
 * `RoleLayout` + `RoleGuards` in `AppRouters.tsx`.
 */
export function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('NAV_DASHBOARD')}</h1>
      <EmptyState title={t('DASHBOARD_EMPTY_TITLE')} description={t('DASHBOARD_EMPTY_BODY')} />
      <Can allowedRoles={[Role.ADMIN]}>
        <p className="text-foreground-muted text-sm">{t('DASHBOARD_ADMIN_ONLY_NOTE')}</p>
      </Can>
    </div>
  );
}
