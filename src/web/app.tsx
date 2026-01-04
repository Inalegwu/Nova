import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import t, { queryClient, trpcClient } from '@/shared/config';
import { QueryClientProvider } from "@tanstack/react-query"
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';
import ErrorComponent from './components/error';
import { routeTree } from './routeTree.gen';

enableReactTracking({
  auto: true,
});

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
        <QueryClientProvider
          client={queryClient}
        >
          <RouterProvider defaultViewTransition router={router} />
        </QueryClientProvider>
      </t.Provider>
    </StrictMode>,
  );
}
