import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';
import { Input } from 'src/components/common/Input';
import { Pagination } from 'src/components/common/Pagination';
import { getPageCount } from 'src/utils/getPageCount';
import {
  exampleSearchSchema,
  type ExampleItem,
  type ExampleSearchValues,
} from 'src/schemas/common/example.schema';
import { useExampleItems } from 'src/hooks/common/useExampleItems';
import { useTableUrlState } from 'src/lib/url-state/useTableUrlState';
import { useModalUrlState } from 'src/lib/url-state/useModalUrlState';
import { AddExampleItemModal } from './AddExampleItemModal';
import { EditExampleItemModal } from './EditExampleItemModal';
import { DeleteExampleItemButton } from './DeleteExampleItemButton';

const DEFAULT_PAGE_SIZE = 10;

interface ExampleWidgetProps {
  /** Section heading. Defaults to a generic label — override per usage. */
  heading?: string;
  /** Items per page. Defaults to the feature's page size. */
  pageSize?: number;
}

/**
 * Reference feature: a paginated, searchable, full-CRUD list — the reference shape
 * for AGENTS.md § Data & State's mutation-invalidation pattern (see
 * src/hooks/common/useCreateExampleItem.ts/useUpdateExampleItem.ts/useDeleteExampleItem.ts)
 * and for docs/adr/url-page-state.md's URL-addressable page state. Demonstrates typed
 * props, RHF+Zod forms, URL + TanStack Query data + mutations, full keyboard/
 * screen-reader accessibility, and token-only Tailwind styling. Search text, page
 * number, and which row's edit modal is open all live in the URL (`?q=...&page=...
 * &modal=edit&id=...`) instead of `useState`/Zustand — a refresh or a shared link
 * reproduces the exact same view.
 */
export function ExampleWidget({ heading, pageSize = DEFAULT_PAGE_SIZE }: ExampleWidgetProps) {
  const { t } = useTranslation();
  const { query, page, setQuery, setPage } = useTableUrlState();
  const editModal = useModalUrlState(['edit'] as const);

  const { register, handleSubmit } = useForm<ExampleSearchValues>({
    resolver: zodResolver(exampleSearchSchema),
    defaultValues: { query },
  });

  const { data, isLoading, isError, refetch } = useExampleItems({ query, page, pageSize });

  // The edit modal's `id` param only names a row — the row itself is looked up from
  // whatever's already loaded, so a stale/bad `id` (e.g. a shared link opened after
  // the item moved off this page) just fails to find a match and the modal stays
  // closed instead of crashing (AGENTS.md: "a bad value in the URL must not break
  // the page").
  const editingItem: ExampleItem | null =
    editModal.modal === 'edit'
      ? (data?.items.find((item) => item.id === editModal.id) ?? null)
      : null;

  const pageCount = data ? getPageCount(data.total, pageSize) : 1;
  const onSubmit = handleSubmit((values) => {
    setQuery(values.query);
  });

  return (
    <section aria-labelledby="example-widget-heading" className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="example-widget-heading" className="text-xl font-semibold">
          {heading ?? t('NAV_EXAMPLE')}
        </h2>
        <AddExampleItemModal />
      </div>

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

      {isLoading ? (
        <p role="status" className="text-foreground-muted">
          {t('LOADING')}
        </p>
      ) : null}

      {isError ? (
        <div role="alert" className="flex items-center gap-3">
          <span className="text-danger">{t('ERROR')}</span>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('BUTTON_RETRY')}
          </Button>
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <p className="text-foreground-muted">{t('EMPTY_RESULTS')}</p>
      ) : null}

      {data && data.items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="border-border bg-surface flex items-start justify-between gap-4 rounded-md border p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-foreground font-medium">{item.title}</span>
                <span className="text-foreground-muted text-sm">{item.description}</span>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    editModal.open('edit', item.id);
                  }}
                >
                  {t('BUTTON_EDIT')}
                </Button>
                <DeleteExampleItemButton item={item} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <EditExampleItemModal
        item={editingItem}
        onOpenChange={(open) => {
          if (!open) editModal.close();
        }}
      />

      {data && data.total > pageSize ? (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      ) : null}
    </section>
  );
}
