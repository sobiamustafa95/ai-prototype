import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { ExampleWidget } from './ExampleWidget';

/**
 * Workflow test: the full search flow (load → search → filtered results / empty
 * / error), through the real MSW-backed network layer — not an isolated render
 * of the component. See AGENTS.md § Testing for why this repo tests at this
 * level rather than unit-testing individual primitives.
 */
describe('ExampleWidget workflow', () => {
  afterEach(() => {
    // Search text/page now live in the URL (a MemoryRouter's own search params),
    // not a module-singleton store, so `renderWithProviders`' fresh MemoryRouter
    // per test already starts clean — nothing left over to reset here.
    cleanup();
  });

  it('loads the initial list from the server', async () => {
    renderWithProviders(<ExampleWidget />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');

    expect(await screen.findByText('Example item 1')).toBeInTheDocument();
    expect(screen.getByText('Example item 10')).toBeInTheDocument();
  });

  it('updates the list when the user searches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'item 25');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('Example item 25')).toBeInTheDocument();
    expect(screen.queryByText('Example item 1')).not.toBeInTheDocument();
  });

  it('shows the empty-results message when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'nothing will match this');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });

  it('shows the error state with a retry action when the server fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExampleWidget />);
    await screen.findByText('Example item 1');

    // '__error__' is the reserved query handlers.ts uses to force a 500.
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), '__error__');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      'An error occurred. Please try again.'
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
