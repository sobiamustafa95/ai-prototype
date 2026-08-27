import { useTranslation } from 'react-i18next';
import { Seo } from 'src/components/common/Seo';
import { ExampleWidget } from 'src/components/example/ExampleWidget';

/** Thin route wrapper around the reusable/embeddable `ExampleWidget` component. */
export function ExamplePage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('NAV_EXAMPLE')} />
      <ExampleWidget heading={t('NAV_EXAMPLE')} />
    </>
  );
}
