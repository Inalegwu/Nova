import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { ipcLink } from 'trpc-electron/renderer';
import type { AppRouter } from './routers/_app';

const t = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      networkMode: 'always',
      onError: (error) => {
        console.error(error);
      },
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 10_000,
  key: 'app_cache',
});

export const trpcClient = t.createClient({
  links: [ipcLink()],
});

export default t;
