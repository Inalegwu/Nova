import ComicVine from 'comic-vine-sdk';
import { Data, Effect } from 'effect';
import { Env } from '@/env';

class ComicVineApiError extends Data.TaggedError('ComicVineApiError')<{
  readonly cause: unknown;
  readonly query: string;
}> {}

class ComicVineNoResultsError extends Data.TaggedError(
  'ComicVineNoResultsError',
)<{
  readonly query: string;
}> {}

type ComicMetadata = {
  id: number;
  name: string;
  volumeName: string | null;
  issueNumber: string | null;
  description: string | null;
  coverImageUrl: string | null;
  publisher: string | null;
  dateAdded: string | null;
};

export class ComicVineService extends Effect.Service<ComicVineService>()(
  'ComicVineService',
  {
    effect: Effect.gen(function* () {
      const apiKey = Env.COMIC_VINE_API_KEY;
      const client = new ComicVine({
        apiKey,
      });

      const searchVolumesByName = (name: string) =>
        Effect.tryPromise({
          try: async () =>
            await client.volume.list({
              limit: 20,
              filter: { name },
            }),
          catch: (cause) => new ComicVineApiError({ cause, query: name }),
        }).pipe(
          Effect.flatMap((result) =>
            result.data.length === 0
              ? Effect.fail(new ComicVineNoResultsError({ query: name }))
              : Effect.succeed(result.data),
          ),
        );

      const searchByName = (query: string) =>
        Effect.tryPromise({
          try: async () =>
            await fetch(
              `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&resources=issue,volume&query=${encodeURIComponent(query)}`,
            ).then((r) => r.json()),
          catch: (cause) => new ComicVineApiError({ cause, query }),
        }).pipe(
          Effect.flatMap((result) =>
            result.status_code !== 1
              ? Effect.fail(
                  new ComicVineApiError({ cause: result.error, query }),
                )
              : result.results.length === 0
                ? Effect.succeed([])
                : Effect.succeed(result.results),
          ),
        );

      const searchIssuesByName = (name: string) =>
        Effect.tryPromise({
          try: async () =>
            await client.issue.list({
              limit: 20,
              filter: { name },
              fieldList: [
                'id',
                'name',
                'issueNumber',
                'description',
                'image',
                'volume',
                'dateAdded',
              ],
            }),
          catch: (cause) => new ComicVineApiError({ cause, query: name }),
        }).pipe(
          Effect.flatMap((result) =>
            result.data.length === 0
              ? Effect.fail(new ComicVineNoResultsError({ query: name }))
              : Effect.succeed(result.data),
          ),
        );

      const toMetadata = (issue: any): ComicMetadata => ({
        id: issue.id,
        name: issue.name ?? null,
        volumeName: issue.volume?.name ?? null,
        issueNumber: issue.issueNumber ?? null,
        description: issue.description ?? null,
        coverImageUrl: issue.image?.originalUrl ?? null,
        publisher: issue.volume?.publisher?.name ?? null,
        dateAdded: issue.dateAdded ?? null,
      });

      const findBestMatch = (query: string) =>
        searchIssuesByName(query).pipe(
          Effect.map((issues) => issues.map(toMetadata)),
        );

      return {
        searchVolumesByName,
        searchIssuesByName,
        findBestMatch,
        searchByName,
      } as const;
    }),
  },
) {}
