import { parserChannel } from "@/shared/channels";
import { parseFileNameFromPath, transformMessage } from "@/shared/utils";
import db from "@/shared/storage";
import { parserSchema } from "@/shared/validations";
import { Effect, Match } from "effect";
import { parentPort } from "node:worker_threads";
import {
  ArchiveService,
  databaseArchiveService,
} from "../services/archive-service";
import { Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { issues } from "@/shared/schema";
import { eq } from "drizzle-orm";

const port = parentPort;

if (!port) throw new Error("Parse Process Port is Missing");

const handleMessage = Effect.fnUntraced(function* ({
  action,
  parsePath,
}: ParserSchema) {
  const archive = yield* ArchiveService;
  const path = yield* Path.Path;

  const filePath = path.normalize(parsePath);

  yield* Effect.log({ filePath });

  yield* Effect.log({ action, parsePath });

  const ext = filePath.includes("cbr")
    ? "cbr"
    : filePath.includes("cbz")
      ? "cbz"
      : "none";

  parserChannel.postMessage({
    isCompleted: false,
    state: "SUCCESS",
    error: null,
    issue: parseFileNameFromPath(filePath),
  });

  const exists = yield* Effect.tryPromise(
    async () =>
      await db.query.issues.findFirst({
        where: (issue, { eq }) =>
          eq(issue.issueTitle, parseFileNameFromPath(filePath)),
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
    issue: parseFileNameFromPath(filePath),
  });

  Match.value({ action, ext }).pipe(
    Match.when({ action: "LINK", ext: "cbr" }, () =>
      archive.rar(filePath).pipe(Effect.runPromise),
    ),
    Match.when({ action: "LINK", ext: "cbz" }, () =>
      archive.zip(filePath).pipe(Effect.runPromise),
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
                parseFileNameFromPath(filePath),
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
    Effect.provide(NodeContext.layer),
    Effect.orDie,
    Effect.runPromise,
  ),
);
