import { Env } from '@/env';
import ComicVine from '@comic-vine/client';
import { Data, Effect } from 'effect';

class ComicVineInitError extends Data.TaggedError('ComicVineInitError')<{
  error: unknown;
}> {}

class ComicVineUseError extends Data.TaggedError('ComicVineUseError')<{
  error: unknown;
}> {}

export const comicVineClient = new ComicVine({
  apiKey: Env.COMIC_VINE_API_KEY,
  client: {
    defaultCacheTTL: Number.POSITIVE_INFINITY,
    throwOnRateLimit: false,
  },
});

type UseFn<A> = (client: ComicVine) => Promise<A>;

export class ComicVineService extends Effect.Service<ComicVineService>()(
  '@nova/core/ComicVine',
  {
    effect: Effect.gen(function* () {
      const client = yield* Effect.try({
        try: () =>
          new ComicVine({
            apiKey: Env.COMIC_VINE_API_KEY,
            client: {
              defaultCacheTTL: Number.POSITIVE_INFINITY,
              throwOnRateLimit: false,
            },
          }),
        catch: (error) => new ComicVineInitError({ error }),
      });

      const use = <A>(fn: UseFn<A>) =>
        Effect.tryPromise({
          try: async () => await fn(client),
          catch: (error) => new ComicVineUseError({ error }),
        });

      return {
        client,
        use,
      };
    }),
  },
) {}
