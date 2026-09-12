import { publicProcedure, router } from '@/trpc';
import { deeplinkChannel, deletionChannel, parserChannel } from '../channels';
import { channelToAsyncIterable, parseFileNameFromPath } from '../utils';
import issueRouter from './issue';
import libraryRouter from './library';
import { pages } from './pages';
import { windowRouter } from './window';

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  pages,
  deeplink: publicProcedure.subscription(async function* (opts) {
    for await (const evt of channelToAsyncIterable<DeeplinkChannel>(
      deeplinkChannel,
      'message',
      opts.signal,
    )) {
      console.log(evt);
      const exists = await opts.ctx.db.query.issues.findFirst({
        where: (fields, { eq }) =>
          eq(fields.issueTitle, parseFileNameFromPath(evt.path)),
        columns: { id: true },
      });

      if (!exists) {
        console.log('not previously saved');
        continue;
      }

      yield { issueId: exists.id };
    }
  }),
  additions: publicProcedure.subscription(async function* (opts) {
    for await (const evt of channelToAsyncIterable<ParserChannel>(
      parserChannel,
      'message',
      opts.signal,
      () => parserChannel.close(),
    )) {
      console.log(evt);
      yield evt;
    }
  }),
  deletions: publicProcedure.subscription(async function* (opts) {
    for await (const evt of channelToAsyncIterable<DeletionChannel>(
      deletionChannel,
      'message',
      opts.signal,
      () => deletionChannel.close(),
    )) {
      console.log(evt);
      yield evt;
    }
  }),
});

export type AppRouter = typeof appRouter;
