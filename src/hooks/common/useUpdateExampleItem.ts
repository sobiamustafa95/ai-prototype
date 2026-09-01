import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';
import type { ExampleItemInput } from 'src/schemas/common/example.schema';
import { exampleService } from 'src/services/common/exampleService';

interface UpdateExampleItemArgs extends ExampleItemInput {
  id: string;
}

/**
 * Updates an example item; see useCreateExampleItem.ts for the invalidation shape.
 * The raw HTTP call lives in `exampleService.update`, not here (AGENTS.md § Data & State).
 */
export function useUpdateExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateExampleItemArgs) => exampleService.update(id, input),
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_UPDATED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
