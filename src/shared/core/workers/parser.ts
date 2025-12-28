import { parserChannel } from "../../channels";
import { parseFileNameFromPath, transformMessage } from "../../utils";
import db from "../../storage";
import { Effect, Match } from "effect";
import { parentPort } from "node:worker_threads";
import {
  ArchiveService,
  databaseArchiveService,
} from "../services/archive-service";
import { issues } from "../../schema";
import { eq } from "drizzle-orm";
import path from "node:path";
import { parserSchema } from "../../validations";

const port = parentPort;

if (!port) throw new Error("Parse Process Port is Missing");

const handleMessage = Effect.fnUntraced(function* ({
  action,
  parsePath,
}: ParserSchema) {
  const archive = yield* ArchiveService;

  const ext = parsePath.includes("cbr")
    ? "cbr"
    : parsePath.includes("cbz")
      ? "cbz"
      : "none";

  yield* Effect.log({ action, parsePath, ext });

  parserChannel.postMessage({
    isCompleted: false,
    state: "SUCCESS",
    error: null,
    issue: parseFileNameFromPath(parsePath),
  });

  const exists = yield* Effect.tryPromise(
    async () =>
      await db.query.issues.findFirst({
        where: (issue, { eq }) =>
          eq(issue.issueTitle, parseFileNameFromPath(parsePath)),
      }),
  );

  if (exists) {
    yield* Effect.log(exists);
    parserChannel.postMessage({
      isCompleted: true,
      error: `${exists.issueTitle} is already in your library`,
      state: "ERROR",
    });
    return;
  }

  parserChannel.postMessage({
    isCompleted: false,
    state: "SUCCESS",
    error: null,
    issue: parseFileNameFromPath(parsePath),
  });

  Match.value({ action, ext }).pipe(
    Match.when({ action: "LINK", ext: "cbr" }, () =>
      archive.rar(parsePath).pipe(Effect.runPromise),
    ),
    Match.when({ action: "LINK", ext: "cbz" }, () =>
      archive.zip(parsePath).pipe(Effect.runPromise),
    ),
    Match.when({ action: "LINK", ext: "none" }, () => Effect.void),
    Match.when({ action: "UNLINK" }, () =>
      (async () => {
        await db
          .delete(issues)
          .where(
            eq(
              issues.path,
              path.join(
                process.env.cache_dir!,
                parseFileNameFromPath(parsePath),
              ),
            ),
          );
      })(),
    ),
  );
});

port.on("message", (message) =>
  transformMessage(parserSchema, message).pipe(
    Effect.matchEffect({
      onSuccess: (message) => handleMessage(message),
      onFailure: Effect.logFatal,
    }),
    Effect.annotateLogs({
      worker: "parser-worker",
    }),
    Effect.provideService(ArchiveService, databaseArchiveService),
    Effect.orDie,
    Effect.runPromise,
  ),
);
