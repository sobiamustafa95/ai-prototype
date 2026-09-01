import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'src/constants/queryKeys';
import { exampleService } from 'src/services/common/exampleService';

/**
 * `page`/`pageSize` is this repo's demonstrated pagination shape, not a hard
 * requirement — `getPageCount.ts`, `Pagination.tsx`, and this hook's own `queryKey`
 * all assume offset/page-based pagination. A cursor-paginated API needs adapting
 * this shape (args become `{ query, cursor }`, the response gets a `nextCursor`
 * instead of `total`/`page`, and the `queryKey` carries the cursor instead of a page
 * number) rather than forcing a cursor API to fit this exact interface.
 */
interface UseExampleItemsArgs {
  query: string;
  page: number;
  pageSize: number;
}

/**
 * Feature hook: server state for the example list via TanStack Query. Owns only the
 * query wiring (cache key, `placeholderData`) — the actual HTTP call + boundary Zod
 * validation live in `src/services/common/exampleService.ts` (AGENTS.md § Data & State:
 * a hook's `queryFn`/`mutationFn` calls a service function, it never calls `apiClient`
 * itself).
 */
export function useExampleItems(args: UseExampleItemsArgs) {
  return useQuery({
    queryKey: [QueryKey.EXAMPLE_LIST, args] as const,
    queryFn: () => exampleService.list(args),
    placeholderData: (previous) => previous,
  });
}
