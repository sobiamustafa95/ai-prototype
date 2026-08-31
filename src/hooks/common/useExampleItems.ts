import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'src/services/api-client';
import { ExampleRoutes } from 'src/constants/api-routes';
import { QueryKey } from 'src/constants/queryKeys';
import { exampleItemSchema, type ExampleItem } from 'src/schemas/example.schema';
import type { ApiResponse, Paginated } from 'src/types/common';
import { z } from 'zod';

/**
 * `page`/`pageSize` is this repo's demonstrated pagination shape, not a hard
 * requirement — `getPageCount.ts`, `Pagination.tsx`, and this hook's own `queryKey`
 * all assume offset/page-based pagination. A cursor-paginated API needs adapting
 * this shape (args become `{ query, cursor }`, `responseSchema` gets a `nextCursor`
 * instead of `total`/`page`, and the `queryKey` carries the cursor instead of a page
 * number) rather than forcing a cursor API to fit this exact interface.
 */
interface UseExampleItemsArgs {
  query: string;
  page: number;
  pageSize: number;
}

const responseSchema = z.object({
  items: z.array(exampleItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

async function fetchExampleItems({
  query,
  page,
  pageSize,
}: UseExampleItemsArgs): Promise<Paginated<ExampleItem>> {
  const { data } = await apiClient.get<ApiResponse<Paginated<ExampleItem>>>(ExampleRoutes.LIST, {
    params: { q: query, page, pageSize },
  });
  // A non-2xx response already threw (as an ApiError) before axios resolved here.
  // Validate the payload at the boundary so the UI can trust its shape.
  return responseSchema.parse(data.data);
}

/** Feature hook: server state for the example list via TanStack Query. */
export function useExampleItems(args: UseExampleItemsArgs) {
  return useQuery({
    queryKey: [QueryKey.EXAMPLE_LIST, args] as const,
    queryFn: () => fetchExampleItems(args),
    placeholderData: (previous) => previous,
  });
}
