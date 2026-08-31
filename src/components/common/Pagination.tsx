import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/common/Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** Generic prev/next pager — `ExampleWidget` (src/components/example/) uses this directly; use it for new features too instead of hand-rolling the same prev/next block again. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('LABEL_PAGINATION')} className="flex items-center justify-between">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        {t('BUTTON_PREVIOUS')}
      </Button>
      <span aria-live="polite" className="text-foreground-muted text-sm">
        {page} / {pageCount}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        {t('BUTTON_NEXT')}
      </Button>
    </nav>
  );
}
