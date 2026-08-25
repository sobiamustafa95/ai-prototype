import { create } from 'zustand';

interface ExampleWidgetState {
  query: string;
  page: number;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
}

const PAGE_SIZE = 10;

/**
 * Feature-scoped UI state for ExampleWidget. Lives inside the feature folder
 * (not the global src/stores) because it is meaningless outside this feature.
 */
export const useExampleWidgetStore = create<ExampleWidgetState>((set) => ({
  query: '',
  page: 1,
  // Changing the query always resets pagination to the first page.
  setQuery: (query) => set({ query, page: 1 }),
  setPage: (page) => set({ page: Math.max(1, page) }),
}));

export const EXAMPLE_PAGE_SIZE = PAGE_SIZE;
