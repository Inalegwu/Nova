import { Data, Effect, Stream } from 'effect';
import { trpcClient } from '@/shared/config';

export class PageReadError extends Data.TaggedError('PageReadError')<{
  readonly cause: unknown;
}> {}

export const pageStream = (
  issueId: string,
  pageIndex: number,
): Stream.Stream<Uint8Array, PageReadError> =>
  Stream.async<Uint8Array, PageReadError>((emit) => {
    const subscription = trpcClient.pages.readPage.subscribe(
      { issueId, pageIndex },
      {
        onData: (chunk) => {
          emit.single(new Uint8Array(chunk));
        },
        onError: (err) => {
          console.log(err);
          emit.fail(new PageReadError({ cause: err }));
        },
        onComplete: () => {
          emit.end();
        },
      },
    );

    return Effect.sync(() => subscription.unsubscribe());
  });
