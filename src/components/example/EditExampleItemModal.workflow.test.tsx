import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetExampleItems } from 'src/mocks/handlers';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { ExampleWidget } from './ExampleWidget';

function getRow(itemText: string): HTMLElement {
  const row = screen.getByText(itemText).closest('li');
  if (!row) throw new Error(`Expected "${itemText}" to be inside a <li> row`);
  return row;
}

/**
 * Workflow test: edit an item and prove the list actually reflects the change — same
 * "list actually changes" bar as AddExampleItemModal's own test, not just that the
 * PATCH resolved.
 */
describe('EditExampleItemModal workflow', () => {
  afterEach(() => {
    cleanup();
    resetExampleItems();
  });

  it('edits an item and the list shows the updated title once the mutation settles', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(within(getRow('Example item 1')).getByRole('button', { name: 'Edit' }));

    const titleInput = await screen.findByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Renamed item');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Renamed item')).toBeInTheDocument();
    expect(screen.queryByText('Example item 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pre-fills the form with the row being edited', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 2');

    await user.click(within(getRow('Example item 2')).getByRole('button', { name: 'Edit' }));

    expect(await screen.findByLabelText('Title')).toHaveValue('Example item 2');
  });

  it('shows the error state when the server fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.click(within(getRow('Example item 1')).getByRole('button', { name: 'Edit' }));

    const titleInput = await screen.findByLabelText('Title');
    await user.clear(titleInput);
    // '__error__' is the reserved title handlers.ts uses to force a 500 on update.
    await user.type(titleInput, '__error__');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      'An error occurred. Please try again.'
    );
  });
});
