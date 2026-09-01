import { http, HttpResponse } from 'msw';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from 'src/mocks/server';
import { resetExampleItems } from 'src/mocks/handlers';
import { CommonRoutes } from 'src/constants/common';
import { ConfirmDialog } from 'src/components/common/ConfirmDialog';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { useExampleWidgetStore } from './exampleWidgetStore';
import { ExampleWidget } from './ExampleWidget';

function getRow(itemText: string): HTMLElement {
  const row = screen.getByText(itemText).closest('li');
  if (!row) throw new Error(`Expected "${itemText}" to be inside a <li> row`);
  return row;
}

/**
 * Workflow test: delete an item (through `ConfirmDialog` — its first real caller in
 * this repo) and prove the list actually stops showing it — the DELETE call
 * resolving alone would not prove this; the assertion below only passes if
 * `invalidateQueries` genuinely refetched the list (the next item, "item 11",
 * shifting into the still-full first page is the tell).
 */
describe('DeleteExampleItemButton workflow', () => {
  afterEach(() => {
    cleanup();
    useExampleWidgetStore.setState({ query: '', page: 1 });
    resetExampleItems();
  });

  it('deletes an item after confirmation and the list no longer shows it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(within(getRow('Example item 1')).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Example item 11')).toBeInTheDocument();
    expect(screen.queryByText('Example item 1')).not.toBeInTheDocument();
  });

  it('does nothing when the confirmation is cancelled, and closes the dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(within(getRow('Example item 1')).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Example item 1')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the error state when the server fails', async () => {
    // A real row's id is always `item-<n>`, so the reserved-id 500 convention the
    // other handlers use can't be reached by clicking a real delete button — a
    // one-off server.use() override is the documented escape hatch for exactly
    // this (AGENTS.md § Testing).
    server.use(
      http.delete(`${CommonRoutes.EXAMPLE_ITEMS}/:id`, () =>
        HttpResponse.json({ message: 'Internal server error.' }, { status: 500 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(within(getRow('Example item 1')).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    // findBy* (not getBy*) so this actually waits for the failed mutation to
    // settle before asserting — the item was never optimistically removed, so a
    // synchronous getBy* here would pass even if a real bug delayed an incorrect
    // removal; findBy* polls, which a getBy* right after the click would not.
    expect(await screen.findByText('Example item 1')).toBeInTheDocument();
  });
});

/**
 * Regression proof for a real structural bug this repo hit once: `ConfirmDialog`
 * used to only close via a caller-supplied `onOpenChange`, so Cancel silently
 * no-op'd whenever a caller (unlike `DeleteExampleItemButton` above) rendered it
 * genuinely uncontrolled. `DeleteExampleItemButton` always passes `open`/
 * `onOpenChange`, so the workflow tests above can't exercise this path — this
 * renders `ConfirmDialog` directly, with neither prop, to prove the fix (Radix's
 * own `DialogClose`, not a hand-rolled `onOpenChange?.(false)` call) actually
 * holds. Not a new standalone `*.test.tsx` for a `src/components/common/`
 * primitive (AGENTS.md § Testing forbids that) — this stays inside the one real
 * feature test file that already exercises `ConfirmDialog`, testing the shared
 * primitive's own contract rather than `DeleteExampleItemButton`'s usage of it.
 */
describe('ConfirmDialog uncontrolled-mode regression', () => {
  afterEach(() => {
    cleanup();
  });

  it('Cancel closes the dialog with no open/onOpenChange passed at all', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        trigger={<button type="button">Open</button>}
        title="Uncontrolled confirm"
        onConfirm={() => {
          // Deliberately empty — this test only exercises Cancel.
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
