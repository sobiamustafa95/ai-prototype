import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'src/App';
import { CONFIG } from 'src/constants/config';
import 'src/i18n';
import 'src/index.css';

async function enableMocking(): Promise<void> {
  // `import.meta.env.DEV` is statically false in prod builds, so the MSW worker
  // chunk is tree-shaken out entirely and never ships to users.
  if (!import.meta.env.DEV || !CONFIG.ENABLE_MOCKS) return;
  const { worker } = await import('src/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found');
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
