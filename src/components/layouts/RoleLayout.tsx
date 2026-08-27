import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';
import { ThemeToggle } from 'src/components/common/ThemeToggle';
import { useAuthStore } from 'src/stores/authStore';
import { getNavItemsForRole, getRoleLayout, type NavItem } from 'src/routes/ProtectedRoutes';
import type { TranslationKey } from 'src/i18n';

interface SidebarShellProps {
  titleKey: TranslationKey;
  navItems: NavItem[];
}

/** The one shell design that exists today (`variant: 'sidebar'`). */
function SidebarShell({ titleKey, navItems }: SidebarShellProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();

  return (
    <div className="bg-surface text-foreground flex min-h-screen">
      <aside className="border-border bg-surface-muted w-56 shrink-0 border-r">
        <div className="border-border border-b px-4 py-3">
          <span className="text-base font-semibold">{t(titleKey)}</span>
        </div>
        <nav aria-label={t('LABEL_SIDEBAR_NAV')} className="p-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // NavLink's own `end` prop type doesn't accept `undefined`
                  // explicitly; `false` is its own default for "unset" anyway.
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-surface text-brand-600'
                        : 'text-foreground-muted hover:bg-surface'
                    }`
                  }
                >
                  {t(item.labelKey)}
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

/**
 * Renders the right shell for the current user's role — reads
 * `src/routes/ProtectedRoutes.tsx`'s `getRoleLayout(role)` for which `variant`
 * to use and `getNavItemsForRole(role)` for its nav items (own + common
 * routes), so two roles sharing a `variant` (both example roles do today) get
 * the identical shell for free, and a role that needs a visually different
 * area just needs a new `variant` value + a case here — no router or guard
 * code changes. Wired into `AppRouters.tsx`'s protected route group, where
 * `RoleGuards` guarantees `user` exists by the time this renders.
 */
export function RoleLayout() {
  const role = useAuthStore((state) => state.user?.role);
  const layout = getRoleLayout(role);
  const navItems = getNavItemsForRole(role);

  // `layout.variant` is only ever 'sidebar' today (see RoleLayoutVariant), so
  // there's nothing to branch on yet — reintroduce a switch here once a second
  // variant exists, matching this function's own doc comment above.
  return <SidebarShell titleKey={layout.titleKey} navItems={navItems} />;
}
