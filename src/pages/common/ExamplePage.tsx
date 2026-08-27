import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { ExampleWidget } from 'src/components/example/ExampleWidget';

/**
 * Thin route wrapper around the reusable/embeddable `ExampleWidget` component. Owns the
 * page's one h1 itself (same pattern as every other page, e.g. HomePage/SettingsPage) —
 * ExampleWidget's own heading stays a generic h2, since embedding it doesn't imply it owns
 * the page's top-level heading (AGENTS.md § Accessibility: heading order isn't skipped).
 */
export function ExamplePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <Seo title={t('NAV_EXAMPLE')} />
      <h1 className="text-2xl font-semibold">{t('NAV_EXAMPLE')}</h1>
      <ExampleWidget />
    </div>
  );
}
