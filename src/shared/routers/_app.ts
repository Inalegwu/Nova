import { observable } from '@trpc/server/observable';
import { Console, Effect, Queue, Stream } from 'effect';
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

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  pages,
  taskProgress: publicProcedure.subscription(async function* () {
    yield* Effect.gen(function* () {
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
        Stream.mapEffect((task) => Effect.sync(() => console.log(task)), {
          concurrency: PROCESSING_CONCURRENCY,
        }),
        Stream.runDrain,
      );
    }).pipe(Effect.provide(ProgressChannel.Default), Effect.scoped);
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
