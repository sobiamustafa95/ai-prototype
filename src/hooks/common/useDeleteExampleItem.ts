import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';
import { exampleService } from 'src/services/common/exampleService';

/**
 * Deletes an example item; see useCreateExampleItem.ts for the invalidation shape.
 * The raw HTTP call lives in `exampleService.delete`, not here (AGENTS.md § Data & State).
 */
export function useDeleteExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exampleService.delete(id),
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_DELETED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
