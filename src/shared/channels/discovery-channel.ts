import { BroadcastChannel } from 'node:worker_threads';
import { Data, Effect, Schema, Stream } from 'effect';

const DiscoveredFile = Schema.Struct({
  path: Schema.String,
  name: Schema.String,
  discoveredAt: Schema.Number,
});

type DiscoveredFile = typeof DiscoveredFile.Type;

const CHANNEL_NAME = 'file-discoveries';

// ---------- Errors ----------

class BroadcastPublishError extends Data.TaggedError('BroadcastPublishError')<{
  readonly cause: unknown;
}> {}

class BroadcastDecodeError extends Data.TaggedError('BroadcastDecodeError')<{
  readonly cause: unknown;
}> {}

// ---------- Service ----------
// One instance of this per worker (watcher or processor). Each holds its
// own BroadcastChannel handle onto the same named channel; Node fans the
// messages out to every open handle in the process's worker set.

class DiscoveryChannel extends Effect.Service<DiscoveryChannel>()(
  'DiscoveryChannel',
  {
    scoped: Effect.gen(function* () {
      const channel = yield* Effect.acquireRelease(
        Effect.sync(() => new BroadcastChannel(CHANNEL_NAME)),
        (channel) => Effect.sync(() => channel.close()),
      );

      const publish = (file: DiscoveredFile) =>
        Effect.try({
          try: () =>
            channel.postMessage(Schema.encodeSync(DiscoveredFile)(file)),
          catch: (cause) => new BroadcastPublishError({ cause }),
        });

      // A Stream over incoming broadcast messages. One `Stream.async`
      // subscription per consumer — safe to call `subscribe` more than
      // once if you need multiple independent readers in the same worker.
      const subscribe: Stream.Stream<DiscoveredFile, BroadcastDecodeError> =
        Stream.async<DiscoveredFile, BroadcastDecodeError>((emit) => {
          const listener = (event: MessageEvent) => {
            const decoded = Schema.decodeUnknownEither(DiscoveredFile)(
              event.data,
            );
            if (decoded._tag === 'Right') {
              emit.single(decoded.right);
            } else {
              emit.fail(new BroadcastDecodeError({ cause: decoded.left }));
            }
          };

          //   @ts-expect-error
          channel.addEventListener('message', listener);
          return Effect.sync(() =>
            // @ts-expect-error
            channel.removeEventListener('message', listener),
          );
        });

      return { publish, subscribe } as const;
    }),
  },
) {}

export {
  BroadcastDecodeError,
  BroadcastPublishError,
  DiscoveredFile,
  DiscoveryChannel,
};
