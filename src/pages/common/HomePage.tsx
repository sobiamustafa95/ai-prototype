import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from 'src/stores/authStore';
import { getHomeRouteForRole } from 'src/routes/ProtectedRoutes';

/** Landing route. Intentionally generic — replace with a real home per project. */
export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-heading" className="flex flex-col gap-4">
      <h1 id="home-heading" className="text-2xl font-semibold">
        {t('APP_NAME')}
      </h1>
      <p className="text-foreground-muted max-w-prose">{t('EMPTY_LIST')}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/example"
          className="bg-brand-600 inline-flex w-fit items-center rounded-md px-4 py-2 text-base font-semibold text-white"
        >
          {t('NAV_EXAMPLE')}
        </Link>
        <Link
          to={user ? getHomeRouteForRole(user.role) : '/login'}
          className="border-border text-foreground inline-flex w-fit items-center rounded-md border px-4 py-2 text-base font-semibold"
        >
          {user ? t('HOME_CTA_DASHBOARD') : t('HOME_CTA_LOGIN')}
        </Link>
      </div>
    </section>
  );
}
