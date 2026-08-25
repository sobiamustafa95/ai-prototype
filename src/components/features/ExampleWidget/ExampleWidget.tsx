import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';
import { Input } from 'src/components/common/Input';
import { getPageCount } from 'src/utils/getPageCount';
import { exampleSearchSchema, type ExampleSearchValues } from 'src/schemas/example.schema';
import { useExampleItems } from './useExampleItems';
import { EXAMPLE_PAGE_SIZE, useExampleWidgetStore } from './exampleWidgetStore';

interface ExampleWidgetProps {
  /** Section heading. Defaults to a generic label — override per usage. */
  heading?: string;
  /** Items per page. Defaults to the feature's page size. */
  pageSize?: number;
}

/**
 * Reference feature: a paginated, searchable list.
 * Demonstrates typed props, RHF+Zod forms, Zustand UI state, TanStack Query data,
 * full keyboard/screen-reader accessibility, and token-only Tailwind styling.
 */
export function ExampleWidget({ heading, pageSize = EXAMPLE_PAGE_SIZE }: ExampleWidgetProps) {
  const { t } = useTranslation();
  const query = useExampleWidgetStore((state) => state.query);
  const page = useExampleWidgetStore((state) => state.page);
  const setQuery = useExampleWidgetStore((state) => state.setQuery);
  const setPage = useExampleWidgetStore((state) => state.setPage);

  const { register, handleSubmit } = useForm<ExampleSearchValues>({
    resolver: zodResolver(exampleSearchSchema),
    defaultValues: { query },
  });

  const { data, isLoading, isError, refetch } = useExampleItems({ query, page, pageSize });

  const pageCount = data ? getPageCount(data.total, pageSize) : 1;
  const onSubmit = handleSubmit((values) => setQuery(values.query));

  return (
    <section aria-labelledby="example-widget-heading" className="flex flex-col gap-6">
      <h2 id="example-widget-heading" className="text-xl font-semibold">
        {heading ?? t('NAV_EXAMPLE')}
      </h2>

      <form
        role="search"
        aria-label={t('LABEL_SEARCH')}
        onSubmit={(event) => void onSubmit(event)}
        className="flex items-end gap-2"
      >
        <div className="flex-1">
          <Input
            label={t('LABEL_SEARCH')}
            type="search"
            placeholder={t('BUTTON_SEARCH')}
            {...register('query')}
          />
        </div>
        <Button type="submit">{t('BUTTON_SEARCH')}</Button>
      </form>

      {isLoading && (
        <p role="status" className="text-foreground-muted">
          {t('LOADING')}
        </p>
      )}

      {isError && (
        <div role="alert" className="flex items-center gap-3">
          <span className="text-danger">{t('ERROR')}</span>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('BUTTON_RETRY')}
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-foreground-muted">{t('EMPTY_RESULTS')}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="border-border bg-surface flex flex-col gap-1 rounded-md border p-4"
            >
              <span className="text-foreground font-medium">{item.title}</span>
              <span className="text-foreground-muted text-sm">{item.description}</span>
            </li>
          ))}
        </ul>
      )}

      {data && data.total > pageSize && (
        <nav aria-label={t('LABEL_PAGINATION')} className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t('BUTTON_PREVIOUS')}
          </Button>
          <span aria-live="polite" className="text-foreground-muted text-sm">
            {page} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            {t('BUTTON_NEXT')}
          </Button>
        </nav>
      )}
    </section>
  );
}
