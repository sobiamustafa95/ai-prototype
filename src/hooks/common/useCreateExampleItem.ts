import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from 'src/constants/queryKeys';
import { toast } from 'src/stores/toastStore';
import i18n from 'src/i18n';
import { exampleService } from 'src/services/common/exampleService';
import type { ExampleItemInput } from 'src/schemas/common/example.schema';

/**
 * Creates an example item. `onSuccess` is the reference shape for AGENTS.md § Data
 * & State's mutation-invalidation rule: toast, then `return` the invalidation so the
 * mutation stays pending until the refetch actually lands — `useQueryClient()` (React
 * context), never the app's shared `queryClient` singleton import, so this hook also
 * works correctly against a test's own isolated client (see renderWithProviders.tsx).
 * The raw HTTP call lives in `exampleService.create`, not here — this hook only owns
 * the mutation wiring (AGENTS.md § Data & State).
 */
export function useCreateExampleItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExampleItemInput) => exampleService.create(input),
    onSuccess: () => {
      toast.success(i18n.t('EXAMPLE_ITEM_CREATED'));
      return queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] });
    },
  });
}
