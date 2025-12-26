import { Fs } from "@/shared/fs";
import db from "@/shared/storage";
import { Duration, Effect, Mailbox, Schedule } from "effect";
import { parentPort } from "node:worker_threads";
import { z } from "zod";
import { parseFileNameFromPath, transformMessage } from "../../utils";
import * as chokidar from "chokidar";
import { parser } from "@/shared/workers";

const port = parentPort;

if (!port) throw new Error("Parse Process Port is Missing");

const watchFS = Effect.fn(function* (directory: string | null) {
  const mailbox = yield* Mailbox.make<string>({
    strategy: "sliding",
    capacity: 200,
  });

  if (!directory) return;

  const files = yield* Fs.readDirectory(directory).pipe(
    Effect.map((files) => files.filter((file) => !file.isDirectory)),
    Effect.map((files) =>
      files.map((file) => parseFileNameFromPath(file.file)),
    ),
  );

  const unsavedIssues = yield* Effect.tryPromise(
    async () =>
      await db.query.issues.findMany({
        columns: {
          path: true,
        },
      }),
  ).pipe(
    Effect.map((issues) =>
      issues.map((issue) => parseFileNameFromPath(issue.path)),
    ),
    Effect.map((issues) =>
      files.filter((file) => !issues.find((issue) => issue === file)),
    ),
  );

  yield* Effect.log(unsavedIssues);

  yield* mailbox.offerAll(unsavedIssues);

  yield* Effect.logInfo(`watching ${directory} for changes`);
  const chokidar_watcher = yield* Effect.try(() =>
    chokidar.watch(directory, {
      ignoreInitial: true,
    }),
  );

  yield* Effect.forever(
    Effect.try(() =>
      chokidar_watcher.on("add", (parsePath) =>
        parser.postMessage({
          parsePath,
          action: "LINK",
        } satisfies ParserSchema),
      ),
    ),
  ).pipe(Effect.forkDaemon);

  yield* Effect.forever(
    Effect.try(() =>
      chokidar_watcher.on("unlink", (parsePath) =>
        parser.postMessage({
          parsePath,
          action: "UNLINK",
        } satisfies ParserSchema),
      ),
    ),
  ).pipe(Effect.forkDaemon);
});

port.on("message", (message) =>
  transformMessage(z.object({ activate: z.boolean() }), message).pipe(
    Effect.matchEffect({
      onSuccess: ({ activate }) =>
        (() => {
          return watchFS(process.env.source_dir!).pipe(
            Effect.schedule(Schedule.duration(Duration.seconds(10))),
            Effect.catchTags({
              FSError: (error) =>
                Effect.logFatal({
                  cause: error.cause,
                  message: error.message,
                  name: error.name,
                }),
              UnknownException: (exception) =>
                Effect.logFatal({
                  message: exception.message,
                  cause: exception.cause,
                }),
            }),
            Effect.forever,
          );
        })(),
      onFailure: Effect.logFatal,
    }),
    Effect.annotateLogs({
      worker: "watcher",
    }),
    Effect.runPromise,
  ),
);
