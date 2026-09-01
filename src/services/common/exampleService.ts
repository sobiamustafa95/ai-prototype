import { z } from 'zod';
import { apiClient } from 'src/services/api-client';
import { CommonRoutes } from 'src/constants/common';
import {
  exampleItemSchema,
  type ExampleItem,
  type ExampleItemInput,
} from 'src/schemas/common/example.schema';
import type { ApiResponse, Paginated } from 'src/types/common';

interface ListExampleItemsParams {
  query: string;
  page: number;
  pageSize: number;
}

const listResponseSchema = z.object({
  items: z.array(exampleItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

/**
 * Example-items API client — one method per `CommonRoutes.EXAMPLE_ITEMS`-backed
 * endpoint, same shape as `src/services/auth/authService.ts`. Owns the raw HTTP call
 * *and* the boundary Zod validation; the hooks in `src/hooks/common/` (useExampleItems,
 * useCreateExampleItem, useUpdateExampleItem, useDeleteExampleItem) only own the
 * TanStack Query wiring (cache keys, invalidation, toast) — never call `apiClient`
 * directly (AGENTS.md § Data & State).
 */
export const exampleService = {
  async list({ query, page, pageSize }: ListExampleItemsParams): Promise<Paginated<ExampleItem>> {
    const { data } = await apiClient.get<ApiResponse<Paginated<ExampleItem>>>(
      CommonRoutes.EXAMPLE_ITEMS,
      { params: { q: query, page, pageSize } }
    );
    // A non-2xx response already threw (as an ApiError) before axios resolved here.
    // Validate the payload at the boundary so the UI can trust its shape.
    return listResponseSchema.parse(data.data);
  },

  async create(input: ExampleItemInput): Promise<ExampleItem> {
    const { data } = await apiClient.post<ApiResponse<unknown>>(CommonRoutes.EXAMPLE_ITEMS, input);
    return exampleItemSchema.parse(data.data);
  },

  async update(id: string, input: ExampleItemInput): Promise<ExampleItem> {
    // No CommonRoutes member for the per-id path — enum members can only be
    // string/numeric literals, so a route needing a param interpolates its static
    // base at the call site (see AGENTS.md § Constant Registries).
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `${CommonRoutes.EXAMPLE_ITEMS}/${id}`,
      input
    );
    return exampleItemSchema.parse(data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${CommonRoutes.EXAMPLE_ITEMS}/${id}`);
  },
};
