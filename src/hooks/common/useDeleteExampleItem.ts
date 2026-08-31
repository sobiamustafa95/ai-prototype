import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from 'src/services/api-client';
import { ExampleRoutes } from 'src/constants/api-routes';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';

async function deleteExampleItem(id: string) {
  await apiClient.delete(`${ExampleRoutes.LIST}/${id}`);
}

/** Deletes an example item; see useCreateExampleItem.ts for the invalidation shape. */
export function useDeleteExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExampleItem,
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_DELETED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
