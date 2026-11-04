import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import t, { persister, queryClient, trpcClient } from '@/shared/config';
import './app.css';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import ErrorComponent from './components/error';
import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  notFoundMode: 'fuzzy',
  history: createHashHistory(),
  defaultErrorComponent: (props) => <ErrorComponent {...props} />,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement!);

  root.render(
    <StrictMode>
      <t.Provider client={trpcClient} queryClient={queryClient}>
        <PersistQueryClientProvider
          persistOptions={{ persister }}
          client={queryClient}
        >
          <RouterProvider defaultViewTransition router={router} />
        </PersistQueryClientProvider>
      </t.Provider>
    </StrictMode>,
  );
}
