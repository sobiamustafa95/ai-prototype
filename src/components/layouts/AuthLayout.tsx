import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from 'src/components/common/ThemeToggle';

/** Minimal centered shell for unauthenticated routes (login, signup, ...). */
export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="bg-surface-muted flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface border-border relative w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <div className="absolute top-3 right-3">
          <ThemeToggle />
        </div>
        <header>
          <h1 className="text-foreground mb-6 text-center text-xl font-semibold">
            {t('APP_NAME')}
          </h1>
        </header>
        <main aria-label={t('LABEL_MAIN')}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
