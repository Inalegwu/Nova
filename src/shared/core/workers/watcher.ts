import db from "@/shared/storage";
import * as chokidar from "chokidar";
import { Duration, Effect, Match, Queue, Schedule, Stream } from "effect";
import { EventEmitter } from "node:stream";
import { parentPort } from "node:worker_threads";
import { z } from "zod";
import { Fs } from "../../fs";
import { parseFileNameFromPath, transformMessage } from "../../utils";
// @ts-ignore: https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes;
// import parseWorker from "../core/workers/parser?nodeWorker";
import { FileSystem } from "@effect/platform";

EventEmitter.setMaxListeners(200);

const port = parentPort;

if (!port) throw new Error("Parse Process Port is Missing");

const watchFS = Effect.fn(function* (directory: string | null) {
  yield* Effect.logInfo("Starting watcher");
  const unparsedQueue = yield* Queue.unbounded<string>();

  const fs=yield* FileSystem.FileSystem;

  if(!directory) return;

  const watchStream=fs.watch(directory,{
    recursive:true
  }).pipe(
    Stream.map(event=>{

      Match.value(event._tag).pipe(
        Match.when("Create",()=>{
          console.log(event.path)
        }),
        Match.when("Remove",()=>{}),
        Match.orElse(()=>{
          console.log("This action has no bearing on the library")
        })
      )

    }),
    Stream.runDrain
  );


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

  // yield* Effect.log(unsavedIssues);

  yield* unparsedQueue.offerAll(unsavedIssues);

  yield* Effect.logInfo(`watching ${directory} for changes`);
  const chokidar_watcher = yield* Effect.try(() =>
    chokidar.watch(directory, {
      ignoreInitial: true,
    }),
  );

  yield* Effect.forever(
    Effect.try(() =>
      chokidar_watcher.on("add", (parsePath) =>
        Queue.unsafeOffer(unparsedQueue, parsePath),
      ),
    ),
  ).pipe(Effect.forkDaemon);

  yield* Effect.forever(
    Effect.try(() =>
      chokidar_watcher.on("unlink", async (parsePath) =>
        unparsedQueue.unsafeOffer(parsePath),
      ),
    ),
  ).pipe(Effect.forkDaemon);

  while (!(yield* unparsedQueue.isEmpty)) {
    const unparsedPath = yield* Queue.take(unparsedQueue);

    // yield* Effect.logInfo(`Saving ${unparsedPath}`);

    // parseWorker({
    //   name: `parse-worker-${unparsedPath}`,
    // })
    //   .on("message", console.log)
    //   .postMessage({
    //     parsePath: unparsedPath,
    //     action: "LINK",
    //   } satisfies ParserSchema);
  }
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
