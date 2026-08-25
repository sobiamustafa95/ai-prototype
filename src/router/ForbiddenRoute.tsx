import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** 403 landing — reached via `RequireRole`'s default redirect. */
export function ForbiddenRoute() {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">{t('FORBIDDEN_TITLE')}</h1>
      <p className="text-foreground-muted max-w-prose">{t('FORBIDDEN_BODY')}</p>
      <Link to="/" className="text-brand-600 text-sm font-medium underline">
        {t('BACK_TO_HOME')}
      </Link>
    </section>
  );
}
