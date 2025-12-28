import { issues } from "../../schema";
import db from "../../storage";
import { deletionChannel } from "../../channels";
import { Fs } from "../../fs";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { parentPort } from "node:worker_threads";
import workerpool from "workerpool";

const port = parentPort;

if (!port) throw new Error("Illegal State");

const deleteIssue = ({ issueId }: DeletionSchema) =>
  Effect.gen(function* () {
    const issue = yield* Effect.tryPromise(
      async () =>
        await db.query.issues.findFirst({
          where: (fields, { eq }) => eq(fields.id, issueId),
        }),
    );

    if (!issue) {
      deletionChannel.postMessage({
        isDone: false,
      });
      return;
    }

    deletionChannel.postMessage({
      isDone: false,
      title: issue.issueTitle,
    });

    yield* Fs.removeDirectory(issue.path).pipe(
      Effect.catchTag("FSError", (error) =>
        Effect.succeed(
          deletionChannel.postMessage({
            isDone: false,
            title: issue.issueTitle,
            error: error.message,
          }),
        ),
      ),
    );

    const _ = yield* Effect.tryPromise(
      async () =>
        await db.delete(issues).where(eq(issues.id, issue.id)).returning(),
    );

    yield* Effect.logInfo(_.at(0));
  }).pipe(Effect.runPromise);

workerpool.worker({
  delete: deleteIssue,
});
