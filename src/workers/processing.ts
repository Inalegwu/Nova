import {
  type DiscoveredFile,
  DiscoveryChannel,
  ProgressChannel,
} from '@channels';
import { NodeRuntime } from '@effect/platform-node';
import {
  Console,
  Data,
  DateTime,
  Duration,
  Effect,
  Layer,
  Match,
  Queue,
  Schedule,
  Stream,
} from 'effect';
import { ArchiveService } from '@/shared/core/services/archive-service';
import { Indexer } from '@/shared/services';
import db from '@/shared/storage';
import { parseFileNameFromPath } from '@/shared/utils';

const getTimestamp = () =>
  DateTime.unsafeFromDate(new Date()).pipe(DateTime.toEpochMillis);

class FileProcessingError extends Data.TaggedError('FileProcessingError')<{
  readonly path: string;
  readonly cause: unknown;
}> {}

const processFile = Effect.fn(function* (file: DiscoveredFile, taskId: string) {
  const A = yield* ArchiveService;
  const index = yield* Indexer;
  const progress = yield* ProgressChannel;
  const parsePath = file.path;

  yield* progress.publish({
    taskId,
    kind: 'extracting',
    status: 'in-progress',
    timestamp: DateTime.unsafeFromDate(new Date()).pipe(DateTime.toEpochMillis),
  });

  const ext =
    parsePath.includes('cbr') || parsePath.includes('rar')
      ? 'cbr'
      : parsePath.includes('cbz') || parsePath.includes('zip')
        ? 'cbz'
        : 'none';

  const exists = yield* Effect.tryPromise(
    async () =>
      await db.query.issues.findFirst({
        where: (issue, { eq }) =>
          eq(issue.issueTitle, parseFileNameFromPath(file.path)),
      }),
  ).pipe(
    Effect.catchTag('UnknownException', (e) =>
      progress
        .publish({
          kind: 'extracting',
          status: 'failed',
          taskId,
          timestamp: getTimestamp(),
          message: e.message,
        })
        .pipe(
          Effect.andThen(
            Effect.fail(new FileProcessingError({ cause: e, path: file.path })),
          ),
        ),
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

  yield* progress.publish({
    taskId,
    kind: 'extracting',
    status: 'completed',
    timestamp: getTimestamp(),
  });
  yield* Effect.logInfo('Processing complete');
  yield* index.append(file.path);
});

const QUEUE_CAPACITY = 256;
const PROCESSING_CONCURRENCY = 4;

const program = Effect.gen(function* () {
  const discovery = yield* DiscoveryChannel;
  const progress = yield* ProgressChannel;
  const taskId = crypto.randomUUID();
  const queue = yield* Queue.bounded<DiscoveredFile>(QUEUE_CAPACITY);
  const indexer = yield* Indexer;

  // run the first save then load the empty index, this ensures the index file exists
  yield* indexer.save;
  yield* indexer.loadIndex;

  yield* progress.publish({
    kind: 'extracting',
    status: 'pending',
    taskId,
    timestamp: DateTime.unsafeFromDate(new Date()).pipe(DateTime.toEpochMillis),
  });

  // bridge: broadcast channel -> local queue
  yield* discovery.subscribe.pipe(
    Stream.tap(Effect.logInfo),
    Stream.runForEach((file) => Queue.offer(queue, file)),
    Effect.catchAll((error) =>
      Console.error('broadcast subscription failed:', error),
    ),
    Effect.forkScoped,
  );

  // consume with bounded concurrency; failures are logged, not fatal
  yield* Stream.fromQueue(queue).pipe(
    // Stream.filter((item) => indexer.has(item.path)),
    Stream.tap(Effect.logInfo),
    Stream.mapEffect(
      (file) =>
        processFile(file, taskId).pipe(
          Effect.catchAll((error) =>
            Console.error(`failed to process ${error}:`, error.cause),
          ),
        ),
      { concurrency: PROCESSING_CONCURRENCY },
    ),
    Stream.runDrain,
  );

  yield* Effect.forkScoped(indexer.save).pipe(
    Effect.repeat({
      schedule: Schedule.fixed(Duration.seconds(50)),
    }),
  );
});

const MainLayer = Layer.mergeAll(
  DiscoveryChannel.Default,
  ArchiveService.Default,
  ProgressChannel.Default,
  Indexer.Default,
);

program.pipe(Effect.provide(MainLayer), Effect.scoped, NodeRuntime.runMain);
