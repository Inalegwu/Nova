import { BroadcastChannel } from 'node:worker_threads';
import { Data, Effect, Schema, Stream } from 'effect';

const TaskProgress = Schema.Struct({
  taskId: Schema.String,
  kind: Schema.String,
  status: Schema.Literal('pending', 'in-progress', 'completed', 'failed'),
  progress: Schema.optional(Schema.Number),
  message: Schema.optional(Schema.String),
  timestamp: Schema.Number,
});

type TaskProgress = typeof TaskProgress.Type;

const CHANNEL_NAME = 'task-progress';

class ProgressPublishError extends Data.TaggedError('ProgressPublishError')<{
  cause: unknown;
}> {}

class ProgressDecodeError extends Data.TaggedError('ProgressDecodeError')<{
  cause: unknown;
}> {}

class ProgressChannel extends Effect.Service<ProgressChannel>()(
  'ProgressChannel',
  {
    scoped: Effect.gen(function* () {
      const channel = yield* Effect.acquireRelease(
        Effect.sync(() => new BroadcastChannel(CHANNEL_NAME)),
        (channel) => Effect.sync(() => channel.close()),
      );

      const publish = (event: TaskProgress) =>
        Effect.try({
          try: () => channel.postMessage(event),
          catch: (cause) => new ProgressPublishError({ cause }),
        });

      const subscribe: Stream.Stream<TaskProgress, ProgressDecodeError> =
        Stream.async<TaskProgress, ProgressDecodeError>((emit) => {
          const listener = (event: MessageEvent) => {
            const decoded = Schema.decodeUnknownEither(TaskProgress)(
              event.data,
            );
            if (decoded._tag === 'Right') {
              emit.single(decoded.right);
            } else {
              emit.fail(new ProgressDecodeError({ cause: decoded.left }));
            }
          };

          // @ts-expect-error
          channel.addEventListener('message', listener);
          return Effect.sync(() =>
            // @ts-expect-error
            channel.removeEventListener('message', listener),
          );
        });

      return {
        publish,
        subscribe,
      };
    }),
  },
) {}

export {
  ProgressChannel,
  ProgressDecodeError,
  ProgressPublishError,
  TaskProgress,
};
