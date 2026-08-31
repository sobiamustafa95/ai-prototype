import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from 'src/services/api-client';
import { ExampleRoutes } from 'src/constants/api-routes';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';
import { exampleItemSchema, type ExampleItemInput } from 'src/schemas/example.schema';
import type { ApiResponse } from 'src/types/common';

interface UpdateExampleItemArgs extends ExampleItemInput {
  id: string;
}

async function updateExampleItem({ id, ...input }: UpdateExampleItemArgs) {
  // No ExampleRoutes member for the per-id path — enum members can only be
  // string/numeric literals, so a route needing a param interpolates its static
  // base at the call site (see AGENTS.md § Constant Registries).
  const { data } = await apiClient.patch<ApiResponse<unknown>>(
    `${ExampleRoutes.LIST}/${id}`,
    input
  );
  return exampleItemSchema.parse(data.data);
}

/** Updates an example item; see useCreateExampleItem.ts for the invalidation shape. */
export function useUpdateExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExampleItem,
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_UPDATED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
