import { Chunk, Data, Duration, Effect, Ref, Schedule, Stream } from 'effect';

export class ImageDecodeError extends Data.TaggedError('ImageDecodeError')<{
  readonly pageIndex: number;
  readonly cause: unknown;
}> {}

export class CanvasRenderError extends Data.TaggedError('CanvasRenderError')<{
  readonly pageIndex: number;
  readonly cause: unknown;
}> {}

type DecodedPage = {
  readonly pageIndex: number;
  readonly bitmap: ImageBitmap;
  readonly width: number;
  readonly height: number;
};

type CacheState = {
  readonly entries: Map<number, DecodedPage>;
  readonly order: number[]; // LRU order, most recent last
};

const MAX_RESIDENT_PAGES = 12;

const concatChunks = (chunks: ReadonlyArray<Uint8Array>): Uint8Array => {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

const insertWithEviction = (
  state: CacheState,
  page: DecodedPage,
  maxSize: number,
): CacheState => {
  const entries = new Map(state.entries);
  entries.set(page.pageIndex, page);
  const order = [
    ...state.order.filter((i) => i !== page.pageIndex),
    page.pageIndex,
  ];

  while (order.length > maxSize) {
    const evictIndex = order.shift()!;
    entries.get(evictIndex)?.bitmap.close();
    entries.delete(evictIndex);
  }

  return { entries, order };
};

// ---------- Service ----------

export class ImageRenderer extends Effect.Service<ImageRenderer>()(
  'ImageRenderer',
  {
    scoped: Effect.gen(function* () {
      const cacheState = yield* Ref.make<CacheState>({
        entries: new Map(),
        order: [],
      });

      const decode = (pageIndex: number, buffer: Uint8Array) =>
        Effect.gen(function* () {
          const cache = yield* Ref.get(cacheState);
          const cached = cache.entries.get(pageIndex);
          if (cached) return cached;

          const bitmap = yield* Effect.tryPromise({
            try: () => createImageBitmap(new Blob([new Uint8Array(buffer)])),
            catch: (cause) => new ImageDecodeError({ pageIndex, cause }),
          }).pipe(
            Effect.retry(
              Schedule.exponential(Duration.millis(50)).pipe(
                Schedule.compose(Schedule.recurs(2)),
              ),
            ),
          );

          const page: DecodedPage = {
            pageIndex,
            bitmap,
            width: bitmap.width,
            height: bitmap.height,
          };

          yield* Ref.update(cacheState, (state) =>
            insertWithEviction(state, page, MAX_RESIDENT_PAGES),
          );

          return page;
        });

      // Collects a byte stream (disk read, archive entry, IPC chunks — doesn't
      // matter which) into a single buffer, then decodes. createImageBitmap
      // needs the whole blob, so this buys cancellability on the read, not
      // progressive rendering.
      const decodeFromStream = <E>(
        pageIndex: number,
        stream: Stream.Stream<Uint8Array, E>,
      ): Effect.Effect<DecodedPage, ImageDecodeError | E> =>
        Effect.gen(function* () {
          const cache = yield* Ref.get(cacheState);
          const cached = cache.entries.get(pageIndex);
          if (cached) return cached;

          const chunks = yield* Stream.runCollect(stream);
          const buffer = concatChunks(Chunk.toReadonlyArray(chunks));

          return yield* decode(pageIndex, buffer);
        });

      const drawToCanvas = (
        page: DecodedPage,
        canvas: OffscreenCanvas | HTMLCanvasElement,
      ) =>
        Effect.gen(function* () {
          yield* Effect.log('Drawing...');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return yield* Effect.fail(
              new CanvasRenderError({
                pageIndex: page.pageIndex,
                cause: 'no 2d context',
              }),
            );
          }

          canvas.width = page.width;
          canvas.height = page.height;

          yield* Effect.try({
            try: () => ctx.drawImage(page.bitmap, 0, 0),
            catch: (cause) =>
              new CanvasRenderError({ pageIndex: page.pageIndex, cause }),
          });

          return page;
        });

      const render = (
        pageIndex: number,
        buffer: Uint8Array,
        canvas: OffscreenCanvas | HTMLCanvasElement,
      ) =>
        decode(pageIndex, buffer).pipe(
          Effect.flatMap((page) => drawToCanvas(page, canvas)),
        );

      const renderFromStream = <E>(
        pageIndex: number,
        stream: Stream.Stream<Uint8Array, E>,
        canvas: OffscreenCanvas | HTMLCanvasElement,
      ): Effect.Effect<DecodedPage, ImageDecodeError | CanvasRenderError | E> =>
        decodeFromStream(pageIndex, stream).pipe(
          Effect.flatMap((page) => drawToCanvas(page, canvas)),
        );

      // Fire-and-forget decode for pages the reader hasn't reached yet.
      const preload = <E>(
        pageIndex: number,
        stream: Stream.Stream<Uint8Array, E>,
      ) =>
        decodeFromStream(pageIndex, stream).pipe(
          Effect.asVoid,
          Effect.forkDaemon,
        );

      const evict = (pageIndex: number) =>
        Ref.update(cacheState, (state) => {
          state.entries.get(pageIndex)?.bitmap.close();
          const entries = new Map(state.entries);
          entries.delete(pageIndex);
          return { entries, order: state.order.filter((i) => i !== pageIndex) };
        });

      const clear = Ref.updateAndGet(cacheState, (state) => {
        for (const page of state.entries.values()) page.bitmap.close();
        return { entries: new Map(), order: [] };
      }).pipe(Effect.asVoid);

      yield* Effect.addFinalizer(() => clear);

      return {
        decode,
        decodeFromStream,
        render,
        renderFromStream,
        preload,
        evict,
        clear,
      } as const;
    }),
  },
) {}
