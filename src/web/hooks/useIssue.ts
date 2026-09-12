import {
  type CanvasRenderError,
  type ImageDecodeError,
  ImageRenderer,
  type PageReadError,
  pageStream,
} from '@renderer';
import { Effect, Fiber, Layer, ManagedRuntime } from 'effect';
import { useCallback, useEffect, useState } from 'react';
import { trpcClient } from '@/shared/config';

const runtime = ManagedRuntime.make(Layer.mergeAll(ImageRenderer.Default));

const pageKey = (issueId: string, pageIndex: number) =>
  `${issueId}:${pageIndex}`;

export function useComicFolder(issueId: string) {
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    'idle',
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    trpcClient.pages.list
      .query({ issueId })
      .then((count) => {
        if (cancelled) return;
        setPageCount(count);
        setStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [issueId]);

  return { pageCount, status };
}

// ---------- useComicPage ----------
// Streams + decodes + renders one page. Page-flip or unmount interrupts the
// in-flight fiber, which tears down the tRPC subscription, which aborts the
// main-process file read — the whole chain is cancellation-aware end to end.

type PageStatus = 'idle' | 'loading' | 'loaded' | 'error';

export function useComicPage(pageIndex: number, issueId: string) {
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasNode(node);
  }, []);

  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<
    ImageDecodeError | CanvasRenderError | PageReadError | null
  >(null);

  useEffect(() => {
    if (!canvasNode) return;

    setStatus('loading');
    setError(null);

    const program = Effect.gen(function* () {
      const renderer = yield* ImageRenderer;
      const stream = pageStream(issueId, pageIndex);
      yield* renderer.renderFromStream(
        pageKey(issueId, pageIndex),
        stream,
        canvasNode,
      );
    });

    const fiber = runtime.runFork(
      program.pipe(
        Effect.tap(() => Effect.sync(() => setStatus('loaded'))),
        Effect.catchAll((cause) =>
          Effect.sync(() => {
            setStatus('error');
            setError(cause);
          }),
        ),
      ),
    );

    return () => {
      runtime.runFork(Fiber.interrupt(fiber));
    };
  }, [pageIndex, issueId, canvasNode]);

  return { canvasRef, status, error };
}

// ---------- usePreloadPages ----------
// Warms the decode cache for upcoming/adjacent pages without blocking the
// page currently being rendered.
export function usePreloadPages(
  currentIndex: number,
  offsets: ReadonlyArray<number>,
  issueId: string,
  pageCount: number,
) {
  useEffect(() => {
    const fibers = offsets
      .map((offset) => currentIndex + offset)
      .filter((pageIndex) => pageIndex >= 0 && pageIndex < pageCount)
      .map((pageIndex) =>
        runtime.runFork(
          Effect.gen(function* () {
            const renderer = yield* ImageRenderer;
            const stream = pageStream(issueId, pageIndex);
            yield* renderer.preload(pageIndex, stream);
          }),
        ),
      );

    return () => {
      for (const fiber of fibers) runtime.runFork(Fiber.interrupt(fiber));
    };
  }, [currentIndex, issueId]);
}

// ---------- Example: putting it together ----------
//
// function ComicReader({ folderPath }: { folderPath: string }) {
//   const { fileNames, status: folderStatus } = useComicFolder(folderPath)
//   const [pageIndex, setPageIndex] = useState(0)
//
//   const { canvasRef, status, error } = useComicPage(pageIndex, folderPath, fileNames)
//   usePreloadPages(pageIndex, [1, 2, -1], folderPath, fileNames)
//
//   if (folderStatus !== "loaded") return <FolderLoading />
//   if (status === "error") return <PageError error={error} />
//
//   return (
//     <div className="comic-page">
//       {status === "loading" && <PageSkeleton />}
//       <canvas ref={canvasRef} />
//       <button onClick={() => setPageIndex((i) => i - 1)}>Prev</button>
//       <button onClick={() => setPageIndex((i) => i + 1)}>Next</button>
//     </div>
//   )
// }
