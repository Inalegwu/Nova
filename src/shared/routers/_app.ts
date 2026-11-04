import { EventEmitter, on } from 'node:events';
import { observable } from '@trpc/server/observable';
import { Console, Effect, ManagedRuntime, Queue, Stream } from 'effect';
import {
  ProgressChannel,
  type TaskProgress,
} from '@/shared/channels/progress-channel';
import { publicProcedure, router } from '@/trpc';
import issueRouter from './issue';
import libraryRouter from './library';
import { pages } from './pages';
import { windowRouter } from './window';

const QUEUE_CAPACITY = 256;
const PROCESSING_CONCURRENCY = 4;

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
  _taskProgress: publicProcedure.subscription(() =>
    observable<TaskProgress>((emit) =>
      Effect.gen(function* () {
        const progress = yield* ProgressChannel;
        const queue = yield* Queue.bounded<TaskProgress>(QUEUE_CAPACITY);

        yield* progress.subscribe.pipe(
          Stream.runForEach((task) => Queue.offer(queue, task)),
          Effect.catchAll((error) =>
            Console.error('Broadcast subscription failed', error),
          ),
          Effect.forkScoped,
        );

        yield* Stream.fromQueue(queue).pipe(
          Stream.mapEffect((task) => Effect.sync(() => emit.next(task)), {
            concurrency: PROCESSING_CONCURRENCY,
          }),
          Stream.runDrain,
        );
      }).pipe(
        Effect.provide(ProgressChannel.Default),
        Effect.scoped,
        Effect.runSync,
      ),
    ),
  ),
});

export type AppRouter = typeof appRouter;
