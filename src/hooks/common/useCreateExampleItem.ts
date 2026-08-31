import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from 'src/services/api-client';
import { ExampleRoutes } from 'src/constants/api-routes';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';
import { exampleItemSchema, type ExampleItemInput } from 'src/schemas/example.schema';
import type { ApiResponse } from 'src/types/common';

async function createExampleItem(input: ExampleItemInput) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(ExampleRoutes.LIST, input);
  return exampleItemSchema.parse(data.data);
}

/**
 * Creates an example item. `onSuccess` is the reference shape for AGENTS.md § Data
 * & State's mutation-invalidation rule: toast, then `return` the invalidation so the
 * mutation stays pending until the refetch actually lands — `useQueryClient()` (React
 * context), never the app's shared `queryClient` singleton import, so this hook also
 * works correctly against a test's own isolated client (see renderWithProviders.tsx).
 */
export function useCreateExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExampleItem,
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_CREATED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
