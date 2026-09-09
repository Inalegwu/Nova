import { NodeRuntime } from '@effect/platform-node';
import { Console, Data, Effect, Layer, Queue, Stream } from 'effect';
import { type DiscoveredFile, DiscoveryChannel } from './channel';

class FileProcessingError extends Data.TaggedError('FileProcessingError')<{
  readonly path: string;
  readonly cause: unknown;
}> {}

const processFile = (
  file: DiscoveredFile,
): Effect.Effect<void, FileProcessingError> =>
  Effect.tryPromise({
    try: async () => {
      console.log(`processing ${file.name} at ${file.path}`);

      const parsePath = file.path;

      const ext =
        parsePath.includes('cbr') || parsePath.includes('rar')
          ? 'cbr'
          : parsePath.includes('cbz') || parsePath.includes('zip')
            ? 'cbz'
            : 'none';

      console.log({ ext });

      // real work goes here: parse, upload, move to a processed dir, etc.
    },
    catch: (cause) => new FileProcessingError({ path: file.path, cause }),
  });

const QUEUE_CAPACITY = 256;
const PROCESSING_CONCURRENCY = 4;

const program = Effect.gen(function* () {
  const channel = yield* DiscoveryChannel;
  const queue = yield* Queue.bounded<DiscoveredFile>(QUEUE_CAPACITY);

  // bridge: broadcast channel -> local queue
  yield* channel.subscribe.pipe(
    Stream.runForEach((file) => Queue.offer(queue, file)),
    Effect.catchAll((error) =>
      Console.error('broadcast subscription failed:', error),
    ),
    Effect.forkScoped,
  );

  // consume with bounded concurrency; failures are logged, not fatal
  yield* Stream.fromQueue(queue).pipe(
    Stream.mapEffect(
      (file) =>
        processFile(file).pipe(
          Effect.catchAll((error) =>
            Console.error(`failed to process ${error.path}:`, error.cause),
          ),
        ),
      { concurrency: PROCESSING_CONCURRENCY },
    ),
    Stream.runDrain,
  );
});

const MainLayer = Layer.mergeAll(DiscoveryChannel.Default);

program.pipe(Effect.provide(MainLayer), Effect.scoped, NodeRuntime.runMain);
