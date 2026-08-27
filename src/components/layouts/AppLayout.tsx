import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from 'src/components/common/ThemeToggle';
import { useAuthStore } from 'src/stores/authStore';
import { getHomeRouteForRole } from 'src/routes/ProtectedRoutes';

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-foreground-muted'}`;

/** Primary application shell: branded header, primary nav, and the routed main region. */
export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const NAV_ITEMS = [
    { to: '/', label: t('NAV_HOME'), end: true },
    { to: '/example', label: t('NAV_EXAMPLE'), end: false },
  ];

  return (
    <div className="bg-surface text-foreground flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">{t('APP_NAME')}</span>
          <div className="flex items-center gap-4">
            <nav aria-label={t('LABEL_PRIMARY_NAV')}>
              <ul className="flex items-center gap-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={navLinkClassName}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink
                    to={user ? getHomeRouteForRole(user.role) : '/login'}
                    className={navLinkClassName}
                  >
                    {user ? t('NAV_DASHBOARD') : t('NAV_LOGIN')}
                  </NavLink>
                </li>
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main aria-label={t('LABEL_MAIN')} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
