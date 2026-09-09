import { NodeRuntime } from '@effect/platform-node';
import { Console, Data, Effect, Layer, Match, Queue, Stream } from 'effect';
import { ArchiveService } from '@/shared/core/services/archive-service';
import db from '@/shared/storage';
import { parseFileNameFromPath } from '@/shared/utils';
import { type DiscoveredFile, DiscoveryChannel } from './channel';

class FileProcessingError extends Data.TaggedError('FileProcessingError')<{
  readonly path: string;
  readonly cause: unknown;
}> {}

const processFile = Effect.fn(function* (file: DiscoveredFile) {
  const A = yield* ArchiveService;
  const parsePath = file.path;

  yield* Effect.logInfo(`processing ${file.name}`);

  const ext =
    parsePath.includes('cbr') || parsePath.includes('rar')
      ? 'cbr'
      : parsePath.includes('cbz') || parsePath.includes('zip')
        ? 'cbz'
        : 'none';

  yield* Effect.logInfo('checking exists');

  const exists = yield* Effect.tryPromise(
    async () =>
      await db.query.issues.findFirst({
        where: (issue, { eq }) =>
          eq(issue.issueTitle, parseFileNameFromPath(file.path)),
      }),
  ).pipe(
    Effect.catchTag('UnknownException', (e) =>
      Effect.fail(new FileProcessingError({ cause: e, path: file.path })),
    ),
  );

  if (exists) {
    yield* Effect.log(parseFileNameFromPath(file.path), 'already exists');
    return;
  }

  yield* Effect.logInfo(`following .${ext} path`);

  Match.value(ext).pipe(
    Match.when('cbz', () => A.zip(file.path).pipe(Effect.runPromise)),
    Match.when('cbr', () => A.rar(file.path).pipe(Effect.runPromise)),
    Match.when('none', () => console.log('Invalid file extension')),
    Match.orElse(() => {}),
  );

  yield* Effect.logInfo('Processing complete');
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

const MainLayer = Layer.mergeAll(
  DiscoveryChannel.Default,
  ArchiveService.Default,
);

program.pipe(Effect.provide(MainLayer), Effect.scoped, NodeRuntime.runMain);
