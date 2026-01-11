import t, { queryClient, trpcClient, persister } from '@/shared/config';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';
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
