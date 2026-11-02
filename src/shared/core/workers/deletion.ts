import { parentPort } from 'node:worker_threads';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { transformMessage } from '@/shared/utils';
import { deletionWorkerSchema } from '@/shared/validations';
import { Fs } from '../../fs';
import { issues } from '../../schema';
import db from '../../storage';

const port = parentPort;

if (!port) throw new Error('Illegal State');

const deleteIssue = ({ issueId }: DeletionSchema) =>
  Effect.gen(function* () {
    yield* Effect.log({ issueId });

    const issue = yield* Effect.tryPromise(
      async () =>
        await db.query.issues.findFirst({
          where: (fields, { eq }) => eq(fields.id, issueId),
        }),
    );

    if (!issue) {
      return;
    }

    yield* Fs.removeDirectory(issue.path).pipe(
      Effect.catchTag('FSError', (error) => Effect.log(error)),
    );

    yield* Effect.tryPromise(
      async () =>
        await db.delete(issues).where(eq(issues.id, issue.id)).returning(),
    );
  });

port.on('message', (message) =>
  transformMessage(deletionWorkerSchema, message).pipe(
    Effect.matchEffect({
      onSuccess: (message) => deleteIssue(message),
      onFailure: Effect.logFatal,
    }),
    Effect.annotateLogs({
      worker: 'deletion-worker',
    }),
    Effect.orDie,
    Effect.runPromise,
  ),
);
