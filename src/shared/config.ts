import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { ipcLink } from 'electron-trpc/renderer';
import type { AppRouter } from './routers/_app';

const t = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      cacheTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: 'always',
      cacheTime: Number.POSITIVE_INFINITY,
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 500,
  key: 'app_cache',
});

export const trpcClient = t.createClient({
  links: [ipcLink()],
});

export default t;
