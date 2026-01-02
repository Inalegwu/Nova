import { Data, Effect, Encoding } from 'effect';
import { Dump } from './dump';

export class FSError extends Data.TaggedError('FSError')<{
  cause: unknown;
  message: string;
}> {}

export class ArchiveError extends Data.TaggedError('ArchiveError')<{
  cause: unknown;
}> {}

export class TaskError extends Data.TaggedError('TaskError')<{
  cause: unknown;
  message: string;
}> {}

export class DeletionError extends Data.TaggedError('DeletionError')<{
  cause: unknown;
}> {}

export class BuildError extends Data.TaggedError('BuildError')<{
  error: unknown;
}> {}

export const ApplicationError = Data.taggedEnum<
  TaskError | DeletionError | ArchiveError | FSError
>();

export type ApplicationError = typeof ApplicationError;

const ensureError = (
  error: TaskError | DeletionError | ArchiveError | FSError,
) =>
  Effect.gen(function* () {
    const dump = yield* Dump;

    yield* Effect.logError(error);

    const id = Encoding.encodeBase64(`${error._tag}::${Date.now()}`);

    yield* dump
      .writeToDump({
        date: new Date(),
        error: JSON.stringify({
          message: error.message,
          cause: error.cause,
        }),
        id,
      })
      .pipe(
        Effect.andThen(
          Effect.logInfo(`Error saved to dump @ ${process.env.error_dump}`),
        ),
      );
  }).pipe(Effect.provide(Dump.Default));

export const handleApplicationError = ApplicationError.$match({
  DeletionError: (error) => ensureError(error),
  ArchiveError: (error) => ensureError(error),
  TaskError: (error) => ensureError(error),
  FSError: (error) => ensureError(error),
});
