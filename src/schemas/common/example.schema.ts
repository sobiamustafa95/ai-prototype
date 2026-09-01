import { z } from 'zod';
import i18n from 'src/i18n';

/** Search form schema for the ExampleWidget. Reused for RHF validation + typing. */
export const exampleSearchSchema = z.object({
  query: z.string().trim().max(64, 'Search is too long'),
});

export type ExampleSearchValues = z.infer<typeof exampleSearchSchema>;

/** API contract for a single example item. Shared with the MSW handler + service. */
export const exampleItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ExampleItem = z.infer<typeof exampleItemSchema>;

/**
 * Create/edit form schema — the reference shape for building a variant off a base
 * schema (AGENTS.md § Data & State): `.omit()` drops the server-assigned `id`,
 * `.extend()` adds the form-only validation (required, non-empty) the API-contract
 * base schema above doesn't itself carry. Reused by both `AddExampleItemModal` and
 * `EditExampleItemModal` — one schema, one set of error messages, two call sites.
 */
export const exampleItemInputSchema = exampleItemSchema.omit({ id: true }).extend({
  title: z.string().trim().min(1, i18n.t('FORM_REQUIRED')),
  description: z.string().trim().min(1, i18n.t('FORM_REQUIRED')),
});

export type ExampleItemInput = z.infer<typeof exampleItemInputSchema>;
