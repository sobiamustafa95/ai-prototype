import { z } from 'zod';

/** Search form schema for the ExampleWidget. Reused for RHF validation + typing. */
export const exampleSearchSchema = z.object({
  query: z.string().trim().max(64, 'Search is too long'),
});

export type ExampleSearchValues = z.infer<typeof exampleSearchSchema>;

/** API contract for a single example item. Shared with the MSW handler + query. */
export const exampleItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ExampleItem = z.infer<typeof exampleItemSchema>;
