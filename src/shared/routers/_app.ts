import path from 'node:path';
import { Effect, ManagedRuntime, Stream } from 'effect';
import { dialog } from 'electron';
import { ProgressChannel } from '@/shared/channels/progress-channel';
import { publicProcedure, router } from '@/trpc';
import issueRouter from './issue';
import libraryRouter from './library';
import { pages } from './pages';
import { windowRouter } from './window';

const rt = ManagedRuntime.make(ProgressChannel.Default);

const untilAborted = (signal?: AbortSignal) =>
  Effect.async<void>((resume) => {
    if (!signal) return;
    if (signal.aborted) return resume(Effect.void);
    signal.addEventListener('abort', () => resume(Effect.void), { once: true });
  });

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  pages,
  taskProgress: publicProcedure.subscription(async function* ({ signal }) {
    const channel = await rt.runPromise(ProgressChannel);

    yield* Stream.toAsyncIterable(
      channel.subscribe.pipe(
        Stream.tap(Effect.log),
        Stream.interruptWhen(untilAborted(signal)),
      ),
    );
  }),
  pickSourceDirectory: publicProcedure.mutation(async () => {
    const _ = await dialog.showOpenDialog({
      properties: ['openDirectory', 'dontAddToRecent'],
    });

    if (_.canceled) {
      return {
        path: null,
      };
    }

    return {
      path: _.filePaths[0],
      name: path.basename(_.filePaths[0]),
    };
  }),
});

export type AppRouter = typeof appRouter;
