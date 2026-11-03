import { FileSystem } from '@effect/platform';
import { NodeContext } from '@effect/platform-node';
import { Array, Effect, Schema } from 'effect';

const RawSchema = Schema.Array(Schema.String);

class Indexer extends Effect.Service<Indexer>()('Indexer', {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const index = new Set<string>();

    const loadIndex = fs.readFileString(process.env.index_file!).pipe(
      Effect.andThen(Schema.decodeUnknownEither(Schema.String)),
      Effect.flatMap((value) => Effect.sync(() => value.split(','))),
      Effect.andThen(Schema.decodeUnknownEither(RawSchema)),
      Effect.flatMap((result) =>
        Effect.sync(() => {
          result.forEach((value) => {
            index.add(value);
          });
        }),
      ),
      Effect.catchAll(Effect.logFatal),
    );

    const save = fs.writeFileString(
      process.env.index_file!,
      Array.fromIterable(index).join(','),
    );

    const has = (path: string) => index.has(path);
    const append = (path: string) =>
      Effect.sync(() => {
        index.add(path);
      });

    return {
      loadIndex,
      has,
      append,
      save,
    };
  }),
  dependencies: [NodeContext.layer],
}) {}

export { Indexer, RawSchema };
