import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';
import { ThemeToggle } from 'src/components/common/ThemeToggle';
import { useAuthStore } from 'src/stores/authStore';

/**
 * Reference shape for a role-segmented area (e.g. an admin/dashboard section) —
 * sidebar + topbar + routed content, distinct from the public `AppLayout` header
 * nav. This pattern repeats across our real projects (CarnectionIQ, Glow-Tech,
 * Solar-lead all split a protected area into its own sidebar layout). Wired
 * behind `RequireAuth` at `/dashboard` in router.tsx.
 */
export function DashboardLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();
  const SIDEBAR_ITEMS = [{ to: '/dashboard', label: t('NAV_DASHBOARD'), end: true }];

  return (
    <div className="bg-surface text-foreground flex min-h-screen">
      <aside className="border-border bg-surface-muted w-56 shrink-0 border-r">
        <div className="border-border border-b px-4 py-3">
          <span className="text-base font-semibold">{t('APP_NAME')}</span>
        </div>
        <nav aria-label={t('LABEL_SIDEBAR_NAV')} className="p-2">
          <ul className="flex flex-col gap-1">
            {SIDEBAR_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-surface text-brand-600'
                        : 'text-foreground-muted hover:bg-surface'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-border flex items-center justify-end gap-4 border-b px-6 py-3">
          {user && <span className="text-foreground-muted text-sm">{user.email}</span>}
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }));
            }}
          >
            {t('NAV_SIGN_OUT')}
          </Button>
        </header>
        <main aria-label={t('LABEL_MAIN')} className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
