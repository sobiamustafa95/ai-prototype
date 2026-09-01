import { useState } from 'react';
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
import { EXAMPLE_PAGE_SIZE, useExampleWidgetStore } from './exampleWidgetStore';
import { AddExampleItemModal } from './AddExampleItemModal';
import { EditExampleItemModal } from './EditExampleItemModal';
import { DeleteExampleItemButton } from './DeleteExampleItemButton';

interface ExampleWidgetProps {
  /** Section heading. Defaults to a generic label — override per usage. */
  heading?: string;
  /** Items per page. Defaults to the feature's page size. */
  pageSize?: number;
}

/**
 * Reference feature: a paginated, searchable, full-CRUD list — the reference shape
 * for AGENTS.md § Data & State's mutation-invalidation pattern (see
 * src/hooks/common/useCreateExampleItem.ts/useUpdateExampleItem.ts/useDeleteExampleItem.ts).
 * Demonstrates typed props, RHF+Zod forms, Zustand UI state, TanStack Query data +
 * mutations, full keyboard/screen-reader accessibility, and token-only Tailwind styling.
 */
export function ExampleWidget({ heading, pageSize = EXAMPLE_PAGE_SIZE }: ExampleWidgetProps) {
  const { t } = useTranslation();
  const query = useExampleWidgetStore((state) => state.query);
  const page = useExampleWidgetStore((state) => state.page);
  const setQuery = useExampleWidgetStore((state) => state.setQuery);
  const setPage = useExampleWidgetStore((state) => state.setPage);
  // Which row's edit modal is open — transient, component-local UI state, not
  // worth promoting into exampleWidgetStore.ts (see AGENTS.md § Data & State).
  const [editingItem, setEditingItem] = useState<ExampleItem | null>(null);

  const { register, handleSubmit } = useForm<ExampleSearchValues>({
    resolver: zodResolver(exampleSearchSchema),
    defaultValues: { query },
  });

  const { data, isLoading, isError, refetch } = useExampleItems({ query, page, pageSize });

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
                    setEditingItem(item);
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
          if (!open) setEditingItem(null);
        }}
      />

      {data && data.total > pageSize ? (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      ) : null}
    </section>
  );
}
