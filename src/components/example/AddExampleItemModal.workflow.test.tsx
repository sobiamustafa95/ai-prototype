import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetExampleItems } from 'src/mocks/handlers';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { ExampleWidget } from './ExampleWidget';

/**
 * Workflow test: create an item and prove the list actually reflects it — not just
 * that the POST resolved. Renders the full `ExampleWidget` (not the modal alone) so
 * the mutation's `invalidateQueries` has a live list query to actually refetch — see
 * AGENTS.md § Data & State's mutation-invalidation pattern, which this feature is
 * the reference implementation of.
 */
describe('AddExampleItemModal workflow', () => {
  afterEach(() => {
    cleanup();
    resetExampleItems();
  });

  it('adds a new item and the list shows it once the mutation settles', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByLabelText('Title'), 'Brand new item');
    await user.type(screen.getByLabelText('Description'), 'A freshly created item.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Brand new item')).toBeInTheDocument();
    // The modal closed as part of the mutate() call-site's own onSuccess.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows validation errors and never submits when a field is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    // Still open — nothing was submitted.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the error state when the server fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    // '__error__' is the reserved title handlers.ts uses to force a 500 on create.
    await user.type(screen.getByLabelText('Title'), '__error__');
    await user.type(screen.getByLabelText('Description'), 'Triggers the reserved 500 handler.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      'An error occurred. Please try again.'
    );
  });
});
