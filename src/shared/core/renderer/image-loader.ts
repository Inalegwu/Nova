import { Fs } from '@/shared/fs';
import { convertToImageUrl } from '@/shared/utils';
import { Cache, Context, Duration, Effect, Layer, Option, Ref } from 'effect';
import { CacheStats } from 'effect/Cache';
import * as Types from './types';

export type ImageLoader = Readonly<{
  load: (
    source: Types.ImageSource,
  ) => Effect.Effect<HTMLImageElement, Types.ImageError>;
  preload: (
    sources: Types.ImageSource[],
  ) => Effect.Effect<ReadonlyArray<HTMLImageElement>, Types.ImageError>;
  clearCache: Effect.Effect<void>;
  getCacheStats: Effect.Effect<CacheStats>;
}>;

export const ImageLoader = Context.GenericTag<ImageLoader>(
  '@nova/renderer/ImageLoader',
);

const makeImageLoader = Effect.gen(function* () {
  const imageCache = yield* Cache.make({
    capacity: 50,
    timeToLive: Duration.minutes(30),
    lookup: (source: Types.ImageSource) => loadImage(source.url),
  });

  const loadImage = (url: string) =>
    Fs.readFile(url).pipe(
      Effect.flatMap((res) => Effect.succeed(convertToImageUrl(res.buffer))),
      Effect.flatMap((data) =>
        Effect.try(() => {
          const image = new Image();
          image.src = data;
          return image;
        }),
      ),
      Effect.catchAll((e) =>
        Effect.fail(
          new Types.ImageError({
            message: `Failed to load ${url}`,
            cause: e.message,
          }),
        ),
      ),
    );

  const statsRef = yield* Ref.make<CacheStats>({
    size: 0,
    hits: 0,
    misses: 0,
  });

  const load = (source: Types.ImageSource) =>
    Effect.gen(function* () {
      yield* Effect.log(`Loading ${source.url}`);

      const cached = yield* imageCache
        .get(source)
        .pipe(Effect.map((result) => Option.fromNullable(result)));

      if (Option.isSome(cached)) {
        yield* Ref.update(statsRef, (stats) => ({
          ...stats,
          hits: stats.hits + 1,
        }));

        return cached.value;
      } else {
        yield* Ref.update(statsRef, (stats) => ({
          ...stats,
          misses: stats.misses + 1,
          size: stats.size + 1,
        }));
        const image = yield* loadImage(source.url);

        if (source.width === 0 || source.height === 0) {
          // return new Types.ImageSource({
          //   url: source.url,
          //   width: image.naturalWidth,
          //   height: image.naturalHeight,
          //   metadata: source.metadata
          // })
        }

        return image;
      }
    });

  const preload = (sources: Types.ImageSource[]) =>
    Effect.forEach(sources, load, { concurrency: 3 });

  const clearCache = imageCache.invalidateAll;

  const getCacheStats = Ref.get(statsRef);

  return {
    load,
    preload,
    clearCache,
    getCacheStats,
  } satisfies ImageLoader;
});

export const ImageLoaderLayer = Layer.effect(ImageLoader, makeImageLoader);
