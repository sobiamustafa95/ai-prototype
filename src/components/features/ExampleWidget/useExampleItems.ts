import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'src/services/api-client';
import { API_ROUTES } from 'src/constants/api-routes';
import { exampleItemSchema, type ExampleItem } from 'src/schemas/example.schema';
import type { ApiResponse, Paginated } from 'src/types';
import { z } from 'zod';

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
  const { data } = await apiClient.get<ApiResponse<Paginated<ExampleItem>>>(
    API_ROUTES.EXAMPLE.LIST,
    {
      params: { q: query, page, pageSize },
    }
  );
  if (data.status !== 'success' || !data.data) {
    throw new Error(data.error ?? 'Failed to load items');
  }
  // Validate the payload at the boundary so the UI can trust its shape.
  return responseSchema.parse(data.data);
}

/** Feature hook: server state for the example list via TanStack Query. */
export function useExampleItems(args: UseExampleItemsArgs) {
  return useQuery({
    queryKey: ['example-items', args] as const,
    queryFn: () => fetchExampleItems(args),
    placeholderData: (previous) => previous,
  });
}
