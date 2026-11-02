import { router } from '@/trpc';
import issueRouter from './issue';
import libraryRouter from './library';
import { pages } from './pages';
import { windowRouter } from './window';

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  pages,
});

export type AppRouter = typeof appRouter;
