import { Effect, Schema } from 'effect';
import { Fs } from '../../fs';
import { dumpFileSchema, dumpSchema } from '../../validations';

export class Dump extends Effect.Service<Dump>()('Dump', {
  effect: Effect.gen(function* () {
    const writeToDump = (data: DumpSchema) =>
      Effect.Do.pipe(
        Effect.bind('dumpData', () => Schema.decodeUnknown(dumpSchema)(data)),
        Effect.bind('previousDumpData', () =>
          Fs.readFile(process.env.error_dump!).pipe(
            Effect.andThen(Schema.decodeUnknown(dumpFileSchema)),
          ),
        ),
        Effect.andThen(({ dumpData, previousDumpData }) =>
          Fs.writeFile(
            process.env.error_dump!,
            JSON.stringify({
              data: [...previousDumpData.data, dumpData],
            } satisfies DumpFileSchema),
            {},
          ),
        ),
        Effect.catchTags({
          FSError: (error) => Effect.logFatal(error.message),
          ParseError: (error) => Effect.logFatal(error.message),
        }),
      );

    return {
      writeToDump,
    };
  }),
}) {}
