import { DiscoveryChannel } from '@channels';
import { FileSystem, Path } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Data, Effect, Layer, Option, Stream } from 'effect';
import { useGlobalState } from '@/web/state/global';

class WatchSetupError extends Data.TaggedError('WatchSetupError')<{
  readonly path: string;
  readonly cause: unknown;
}> {}

class FileWatcherService extends Effect.Service<FileWatcherService>()(
  'FileWatcherService',
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const channel = yield* DiscoveryChannel;

      const inFlight = new Set<string>();

      const snapshot = (filePath: string) =>
        fs.stat(filePath).pipe(
          Effect.map((info) => ({
            type: info.type,
            size: info.size,
            mtime: Option.getOrNull(info.mtime),
          })),
        );

      const waitForStable = (filePath: string) =>
        Effect.gen(function* () {
          const first = yield* snapshot(filePath);

          if (first.type !== 'File') return false;

          yield* Effect.repeat(
            Effect.gen(function* () {
              const a = yield* snapshot(filePath);
              yield* Effect.sleep('300 millis');
              const b = yield* snapshot(filePath);
              return a.size === b.size && a.mtime === b.mtime;
            }),
            { until: (settled) => settled },
          );

          return true;
        }).pipe(
          Effect.timeout('5 minutes'),
          Effect.catchAll(() => Effect.succeed(false)),
        );

      const settle = (filePath: string) =>
        Effect.gen(function* () {
          if (inFlight.has(filePath)) return Option.none<string>();
          inFlight.add(filePath);

          const ready = yield* waitForStable(filePath).pipe(
            Effect.ensuring(Effect.sync(() => inFlight.delete(filePath))),
          );

          return ready ? Option.some(filePath) : Option.none<string>();
        });

      const watch = (dir: string) =>
        Effect.gen(function* () {
          yield* Console.log(`watching ${dir} for new files`);

          const existing = Stream.fromIterableEffect(
            fs.readDirectory(dir, { recursive: true }),
          ).pipe(
            Stream.map((relative) => path.join(dir, relative)),
            Stream.mapEffect(settle, { concurrency: 32 }),
          );

          const live = fs.watch(dir, { recursive: true }).pipe(
            Stream.tap(Console.log),
            Stream.filter(
              (event) => event._tag === 'Create' || event._tag === 'Update',
            ),
            Stream.tap((e) => Console.log({ tag: e._tag, path: e.path })),
            Stream.mapEffect((event) => settle(event.path), {
              concurrency: 'unbounded',
            }),
          );

          const stream = Stream.merge(existing, live).pipe(
            Stream.filterMap((settled) => settled),
          );

          yield* Stream.runForEach(stream, (filePath) =>
            channel
              .publish({
                path: filePath,
                name: path.basename(filePath),
                discoveredAt: Date.now(),
              })
              .pipe(
                Effect.catchAll((error) =>
                  Console.error(`failed to broadcast ${filePath}`, error.cause),
                ),
              ),
          );
        }).pipe(
          Effect.mapError((cause) => new WatchSetupError({ path: dir, cause })),
        );

      return { watch } as const;
    }),
    dependencies: [NodeContext.layer, DiscoveryChannel.Default],
  },
) {}

// ---------- Program ----------

const program = Effect.gen(function* () {
  const watcher = yield* FileWatcherService;

  const sourceDir = useGlobalState.getState().sourceDirectory;

  const source = sourceDir ?? process.env.source_dir!;

  yield* watcher.watch(source);
});

const MainLayer = Layer.mergeAll(
  FileWatcherService.Default,
  DiscoveryChannel.Default,
  NodeContext.layer,
);

program.pipe(Effect.provide(MainLayer), Effect.scoped, NodeRuntime.runMain);
