import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { NodeRuntime } from '@effect/platform-node';
import { Console, Data, Effect, Fiber, Schedule } from 'effect';
import { app } from 'electron';

// ---------- Errors ----------

class WorkerCrashedError extends Data.TaggedError('WorkerCrashedError')<{
  readonly name: string;
  readonly cause: unknown;
}> {}

// ---------- Worker registry ----------
// electron-vite compiles the main process (and anything built alongside
// it) to .js via esbuild in both dev and packaged builds — only the
// renderer uses the Vite dev server. So workers are always plain .js at
// out/main/workers/*.js; there's no dev/prod format split to handle here.
// (That output path assumes your electron.vite.config.ts adds the two
// worker files as extra rollup entries for the main build — they won't
// land in out/main/workers on their own just by existing as source files.)
//
// What DOES differ between dev and packaged is the path prefix:
// - Dev: main runs from out/main/index.js directly, so __dirname is
//   already out/main.
// - Packaged: main.ts's own __dirname resolves *inside* app.asar, but
//   worker_threads needs a real file on disk, not an asar entry. Hence
//   asarUnpack in build.ts — which mirrors the unpacked file at
//   resources/app.asar.unpacked/<same path it had in the project>, not
//   at a flat resources/workers. So we build that path explicitly from
//   process.resourcesPath instead of trusting __dirname.

type ManagedWorker = {
  readonly name: string;
  readonly path: string;
};

const workersDir = app.isPackaged
  ? path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'out',
      'main',
      'workers',
    )
  : path.join(__dirname);

const workerFile = (name: string) => path.join(workersDir, `${name}.js`);

const WORKERS: ManagedWorker[] = [
  { name: 'watcher', path: workerFile('watcher') },
  { name: 'processor', path: workerFile('processing') },
];

const runWorker = (worker: ManagedWorker) =>
  Effect.async<void, WorkerCrashedError>((resume) => {
    const thread = new Worker(worker.path);

    thread.on('error', (cause) => {
      resume(Effect.fail(new WorkerCrashedError({ name: worker.name, cause })));
    });

    thread.on('exit', (code) => {
      if (code !== 0) {
        resume(
          Effect.fail(
            new WorkerCrashedError({
              name: worker.name,
              cause: new Error(`exited with code ${code}`),
            }),
          ),
        );
      }
    });

    return Effect.sync(() => {
      thread.terminate();
    });
  });

const RESTART_POLICY = Schedule.spaced('1 second').pipe(
  Schedule.intersect(Schedule.recurs(5)),
);

const supervised = (worker: ManagedWorker) =>
  runWorker(worker).pipe(
    Effect.tapError((error) =>
      Console.error(`[${worker.name}] crashed:`, error.cause),
    ),
    Effect.retry(RESTART_POLICY),
    Effect.tapError(() =>
      Console.error(`[${worker.name}] exceeded restart attempts, giving up`),
    ),
  );

// ---------- Program ----------

const program = Effect.gen(function* () {
  yield* Console.log(
    `Starting ${WORKERS.length} workers: ${WORKERS.map((w) => w.name.toUpperCase()).join(', ')}`,
  );

  const fibers = yield* Effect.forEach(WORKERS, (worker) =>
    Effect.fork(supervised(worker)),
  );

  yield* Fiber.joinAll(fibers);
});

program.pipe(
  Effect.scoped,
  Effect.tapErrorCause((cause) => Console.error('fatal:', cause)),
  NodeRuntime.runMain,
);
