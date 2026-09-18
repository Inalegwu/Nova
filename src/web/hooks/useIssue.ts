import {
  animateSlideTransition,
  animateZoom,
  type CanvasRenderError,
  clear,
  type DrawableBitmap,
  drawPage,
  type ImageDecodeError,
  ImageRenderer,
  type PageReadError,
  pageStream,
} from '@renderer';
import { Effect, Fiber, Layer, ManagedRuntime } from 'effect';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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

type PageStatus = 'idle' | 'loading' | 'loaded' | 'error';

export function useComicPage(pageIndex: number, issueId: string) {
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null,
  );
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);

  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasNode(node);
  }, []);

  const viewportRef = useRef({ width: 0, height: 0 });
  const currentPageRef = useRef<DrawableBitmap | undefined>(undefined);
  const prevIndexRef = useRef(pageIndex);
  const zoomStateRef = useRef({ scale: 1, panX: 0, panY: 0 });

  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<
    ImageDecodeError | CanvasRenderError | PageReadError | null
  >(null);

  useLayoutEffect(() => {
    if (!containerNode || !canvasNode) return;

    const applySize = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvasNode.width = Math.round(width * dpr);
      canvasNode.height = Math.round(height * dpr);
      const ctx = canvasNode.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewportRef.current = { width, height };

      if (ctx && currentPageRef.current) {
        clear(ctx, width, height);
        drawPage(
          ctx,
          currentPageRef.current,
          width,
          height,
          zoomStateRef.current,
        );
      }
    };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      applySize(width, height);
    });

    observer.observe(containerNode);
    return () => observer.disconnect();
  }, [containerNode, canvasNode]);

  useEffect(() => {
    if (!canvasNode) return;

    const ctx = canvasNode.getContext('2d');
    if (!ctx) return;

    const prevIndex = prevIndexRef.current;
    const direction: 1 | -1 = pageIndex >= prevIndex ? 1 : -1;
    prevIndexRef.current = pageIndex;

    setStatus('loading');
    setError(null);

    const program = Effect.gen(function* () {
      const renderer = yield* ImageRenderer;
      const stream = pageStream(issueId, pageIndex);
      const toPage = yield* renderer.decodeFromStream(
        pageKey(issueId, pageIndex),
        stream,
      );

      const { width, height } = viewportRef.current;
      const fromPage = currentPageRef.current;

      zoomStateRef.current = { scale: 1, panX: 0, panY: 0 };

      if (fromPage && width > 0 && height > 0) {
        yield* animateSlideTransition(
          ctx,
          width,
          height,
          fromPage,
          toPage,
          direction,
        );
      } else if (width > 0 && height > 0) {
        clear(ctx, width, height);
        drawPage(ctx, toPage, width, height);
      }

      currentPageRef.current = toPage;
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

  const zoomTo = useCallback(
    (scale: number, panX = 0, panY = 0) => {
      const ctx = canvasNode?.getContext('2d');
      const page = currentPageRef.current;
      const { width, height } = viewportRef.current;
      if (!ctx || !page || width === 0 || height === 0) return;

      const from = zoomStateRef.current;
      const to = { scale, panX, panY };

      runtime.runFork(
        animateZoom(ctx, width, height, page, from, to).pipe(
          Effect.tap(() => Effect.sync(() => (zoomStateRef.current = to))),
        ),
      );
    },
    [canvasNode],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const ctx = canvasNode?.getContext('2d');
      const page = currentPageRef.current;
      const { width, height } = viewportRef.current;
      if (!ctx || !page || width === 0 || height === 0) return;

      const current = zoomStateRef.current;
      const next = {
        ...current,
        scale: Math.min(Math.max(current.scale * factor, 1), 4),
      };

      zoomStateRef.current = next;
      clear(ctx, width, height);
      drawPage(ctx, page, width, height, next);
    },
    [canvasNode],
  );

  useEffect(() => {
    if (!canvasNode) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = 1 - e.deltaY * 0.002;
      zoomBy(factor);
    };

    canvasNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvasNode.removeEventListener('wheel', handleWheel);
  }, [canvasNode, zoomBy]);

  return { containerRef, canvasRef, status, error, zoomTo, zoomBy };
}

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
            yield* renderer.preload(pageKey(issueId, pageIndex), stream);
          }),
        ),
      );

    return () => {
      for (const fiber of fibers) runtime.runFork(Fiber.interrupt(fiber));
    };
  }, [currentIndex, issueId]);
}
