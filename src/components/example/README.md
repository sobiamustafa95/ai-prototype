# ExampleWidget Feature

The single, deliberately generic example feature. It proves the boilerplate's
patterns end-to-end without introducing any business domain. **Copy this folder,
rename it, and replace the logic** to start a real feature.

It is also **the reference implementation for AGENTS.md § Data & State's
mutation-invalidation pattern** — a full CRUD screen (list + create + edit + delete),
not just a read-only list. Copy this shape for any feature that needs to mutate a
list something on screen already reads via `useQuery`.

## What it does

Renders a paginated, searchable list of placeholder records. Users can type a query
and page through results, add a new record, edit or delete an existing one (delete
goes through a confirmation dialog). Every mutation invalidates the list so it's
always showing what the server actually has. Everything is keyboard- and
screen-reader-accessible.

## Key components

- `ExampleWidget.tsx` — the feature component (typed props, search form, list,
  pagination, Add/Edit/Delete actions).
- `src/hooks/common/useExampleItems.ts` — TanStack Query hook; fetches + Zod-validates
  the list at the boundary. Keyed off `QueryKey.EXAMPLE_LIST` in the global registry
  (`src/constants/queryKeys.ts`) — a new feature adds its own member there rather than
  defining a local key. Lives in `src/hooks/common/`, not this folder — every hook in
  this repo does (company-wide convention: `src/hooks/<concern>/<hookName>.ts`, `common`
  since this feature isn't role-specific — see `AGENTS.md` § Directory Map).
- `src/hooks/common/useCreateExampleItem.ts` / `useUpdateExampleItem.ts` /
  `useDeleteExampleItem.ts` — one small `useMutation` hook each, same `src/hooks/common/`
  location. Each `onSuccess` is the reference shape for the invalidation rule:
  `toast.success(...)`, then `return
queryClient.invalidateQueries({ queryKey: [QueryKey.EXAMPLE_LIST] })` so the
  mutation stays pending until the refetch actually lands. `useQueryClient()` (React
  context), never the app's shared `queryClient` singleton — the same client a test's
  own `renderWithProviders` supplies.
- `ExampleItemFormFields.tsx` — the title/description inputs shared by the add and
  edit modals (one Zod schema, `exampleItemInputSchema`, one set of error messages).
- `AddExampleItemModal.tsx` / `EditExampleItemModal.tsx` — the create/edit pieces.
  `EditExampleItemModal` is a single controlled instance driven by `ExampleWidget`'s
  own `editingItem` state, not one modal per row.
- `DeleteExampleItemButton.tsx` — the delete action, built on
  `src/components/common/ConfirmDialog.tsx` (its first real caller in this repo).
  `ConfirmDialog`'s Cancel button closes via Radix's own `DialogClose`, so it works
  correctly even in uncontrolled mode (neither `open`/`onOpenChange` passed); this
  component passes both anyway, since it needs to close the dialog itself from the
  outside once its async `onConfirm` (the delete mutation) succeeds.
- `exampleWidgetStore.ts` — feature-scoped Zustand store for `query` / `page` UI
  state. Which modal is open is deliberately _not_ here — that's transient,
  component-local state, not worth promoting into the store.

## Testing

Four `*.workflow.test.tsx` files, one per real flow: `ExampleWidget` (load/search/
empty/error), `AddExampleItemModal`, `EditExampleItemModal`,
`DeleteExampleItemButton` — the create/edit/delete tests each assert the list itself
changes after the mutation (a new/renamed/removed item actually shows up), not just
that the API call resolved, which is the whole point of testing the invalidation
wiring. Because the MSW handlers mutate an in-memory dataset in place
(`src/mocks/handlers.ts`'s `EXAMPLE_ITEMS`) so a create/update/delete is visible on
the very next `GET`, every CRUD test's `afterEach` calls `resetExampleItems()`
(exported from `handlers.ts`) — Vitest isolates test _files_ from each other, not
individual `it()` blocks within the same file, so a mutation from one test would
otherwise leak into the next.

## State approach

- **Server state:** TanStack Query (`useExampleItems` + the three mutation hooks) —
  never a raw `useEffect` fetch.
- **Client/UI state:** a feature-scoped Zustand store (`useExampleWidgetStore`) for
  search/pagination; local `useState` in `ExampleWidget`/`DeleteExampleItemButton`
  for transient modal-open state.
- **Form state:** React Hook Form + Zod (`exampleSearchSchema` for search,
  `exampleItemInputSchema` for create/edit).

## API dependency

- `GET /api/v1/example-items?q=&page=&pageSize=` — list.
- `POST /api/v1/example-items` — create.
- `PATCH /api/v1/example-items/:id` — update.
- `DELETE /api/v1/example-items/:id` — delete.

All mocked by MSW (`src/mocks/handlers.ts`). No `ExampleRoutes` member exists for the
`:id` path — a real `enum` can only hold string/numeric literals, never a function
building a path, so the per-id path interpolates `ExampleRoutes.LIST` at the call
site (`` `${ExampleRoutes.LIST}/${id}` ``) instead — see AGENTS.md § Constant
Registries.

## Known scope limitation: this is a modal-based CRUD reference, not a detail-route one

The pattern demonstrated here is entirely modal-based — create/edit open a `Dialog`
over the same list, there's no "click a row → its own page" route anywhere in this
repo. If a feature genuinely needs a detail route (a full page per record, its own
URL, deep-linkable), nothing here is a worked example of that shape yet — but nothing
about the existing registry blocks it either:

- `ProtectedRoute.path` (`src/routes/ProtectedRoutes.tsx`) is a plain `string` passed
  straight through to React Router (`AppRouters.tsx`'s `<Route path={path.slice(1)}>`),
  so a param segment (e.g. `path: '/example/:id'`) needs no registry shape change —
  it's just another entry in the same array, same as every other route here.
- The detail page reads the param via React Router's `useParams()` and fetches with
  its own `useQuery` (its own `QueryKey` member, e.g. `EXAMPLE_DETAIL`, alongside
  `EXAMPLE_LIST` — see `src/constants/queryKeys.ts`), the same boundary-validated
  shape `src/hooks/common/useExampleItems.ts` already demonstrates for the list.
- Navigating there from a row is an ordinary `<Link to={`/example/${item.id}`}>` (or
  `useNavigate()`), same as any other in-app link.

None of this is built here — this is a scope note for whoever needs the detail-route
shape, not a second reference implementation.
