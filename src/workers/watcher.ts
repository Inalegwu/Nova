import { FileSystem, Path } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Data, Effect, Layer, Stream } from 'effect';
import { DiscoveryChannel } from './channel';

// ---------- Errors ----------

class WatchSetupError extends Data.TaggedError('WatchSetupError')<{
  readonly path: string;
  readonly cause: unknown;
}> {}

// ---------- Service ----------

class FileWatcherService extends Effect.Service<FileWatcherService>()(
  'FileWatcherService',
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const channel = yield* DiscoveryChannel;

      const watch = (dir: string) =>
        Effect.gen(function* () {
          yield* Console.log(`watching ${dir} for new files`);

          const stream = fs
            .watch(dir, {
              recursive: true,
            })
            .pipe(
              // THIS should only report creation or copy in's
              Stream.filter(
                (event) => event._tag === 'Create' || event._tag === 'Update',
              ),
              Stream.tap((e) => Effect.log({ tag: e._tag, path: e.path })),
              Stream.mapEffect((event) =>
                Effect.sleep('150 millis').pipe(Effect.as(event)),
              ),
            );

          yield* Stream.runForEach(stream, (event) =>
            channel
              .publish({
                path: event.path,
                name: path.basename(event.path),
                discoveredAt: Date.now(),
              })
              .pipe(
                Effect.catchAll((error) =>
                  Console.error(
                    `failed to broadcast ${event.path}:`,
                    error.cause,
                  ),
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
  yield* watcher.watch(process.env.source_dir!);
});

const MainLayer = Layer.mergeAll(
  FileWatcherService.Default,
  DiscoveryChannel.Default,
  NodeContext.layer,
);

program.pipe(Effect.provide(MainLayer), Effect.scoped, NodeRuntime.runMain);
