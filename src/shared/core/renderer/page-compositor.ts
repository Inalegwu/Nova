import { Effect } from 'effect';

export type DrawableBitmap = {
  readonly bitmap: ImageBitmap;
  readonly width: number;
  readonly height: number;
};

type FitRect = {
  readonly drawWidth: number;
  readonly drawHeight: number;
  readonly offsetX: number;
  readonly offsetY: number;
};

const fitContain = (
  bitmapWidth: number,
  bitmapHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): FitRect => {
  const scale = Math.min(
    viewportWidth / bitmapWidth,
    viewportHeight / bitmapHeight,
  );
  const drawWidth = bitmapWidth * scale;
  const drawHeight = bitmapHeight * scale;
  return {
    drawWidth,
    drawHeight,
    offsetX: (viewportWidth - drawWidth) / 2,
    offsetY: (viewportHeight - drawHeight) / 2,
  };
};

export type Transform = {
  readonly translateX?: number; // extra px offset, e.g. mid-slide
  readonly scale?: number; // zoom multiplier about viewport center, default 1
  readonly panX?: number; // px pan offset when zoomed, default 0
  readonly panY?: number;
};

export const clear = (
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
) => ctx.clearRect(0, 0, viewportWidth, viewportHeight);

export const drawPage = (
  ctx: CanvasRenderingContext2D,
  page: DrawableBitmap,
  viewportWidth: number,
  viewportHeight: number,
  transform: Transform = {},
) => {
  const { drawWidth, drawHeight, offsetX, offsetY } = fitContain(
    page.width,
    page.height,
    viewportWidth,
    viewportHeight,
  );

  const scale = transform.scale ?? 1;
  const panX = transform.panX ?? 0;
  const panY = transform.panY ?? 0;
  const translateX = transform.translateX ?? 0;

  ctx.save();
  ctx.translate(viewportWidth / 2, viewportHeight / 2);
  ctx.scale(scale, scale);
  ctx.translate(
    -viewportWidth / 2 + translateX + panX,
    -viewportHeight / 2 + panY,
  );
  ctx.drawImage(page.bitmap, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const animateSlideTransition = (
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
  fromPage: DrawableBitmap | undefined,
  toPage: DrawableBitmap,
  direction: 1 | -1,
  durationMs = 250,
): Effect.Effect<void> =>
  Effect.async<void>((resume) => {
    const startTime = performance.now();
    let rafId: number;

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = easeOutCubic(t);

      clear(ctx, viewportWidth, viewportHeight);

      if (fromPage) {
        drawPage(ctx, fromPage, viewportWidth, viewportHeight, {
          translateX: direction * eased * viewportWidth,
        });
      }

      drawPage(ctx, toPage, viewportWidth, viewportHeight, {
        translateX: direction * (eased - 1) * viewportWidth,
      });

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        resume(Effect.void);
      }
    };

    rafId = requestAnimationFrame(frame);

    return Effect.sync(() => cancelAnimationFrame(rafId));
  });

export const animateZoom = (
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
  page: DrawableBitmap,
  from: { scale: number; panX: number; panY: number },
  to: { scale: number; panX: number; panY: number },
  durationMs = 200,
): Effect.Effect<void> =>
  Effect.async<void>((resume) => {
    const startTime = performance.now();
    let rafId: number;

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = easeOutCubic(t);

      clear(ctx, viewportWidth, viewportHeight);
      drawPage(ctx, page, viewportWidth, viewportHeight, {
        scale: from.scale + (to.scale - from.scale) * eased,
        panX: from.panX + (to.panX - from.panX) * eased,
        panY: from.panY + (to.panY - from.panY) * eased,
      });

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        resume(Effect.void);
      }
    };

    rafId = requestAnimationFrame(frame);

    return Effect.sync(() => cancelAnimationFrame(rafId));
  });
