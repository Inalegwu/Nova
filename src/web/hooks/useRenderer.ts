import * as ImageRenderer from '@/shared/core/renderer/renderer';
import * as Types from '@/shared/core/renderer/types';
import { Effect } from 'effect';
import { useEffect, useRef } from 'react';

const makeRenderer = (canvasId: string) =>
  Effect.gen(function* () {
    const renderer = yield* ImageRenderer.ImageRenderer;

    yield* renderer.initialize(canvasId);

    return renderer;
  }).pipe(Effect.provide(ImageRenderer.ImageRendererLayer), Effect.runPromise);

export const useRenderer = (canvasId: string) => {
  const renderer = useRef<ImageRenderer.ImageRenderer | null>(null);

  useEffect(() => {
    (async () => {
      const initialized = await makeRenderer(canvasId);
      if (renderer.current === null) {
        renderer.current = initialized;
      }
    })();
  }, []);

  const renderImage = (source: Types.ImageSource) =>
    renderer.current?.renderImage(source).pipe(Effect.runPromise);

  const animateTransition = (from: Types.ImageSource, to: Types.ImageSource) =>
    renderer.current
      ?.animateTransition(
        from,
        to,
        new Types.AnimationConfig({
          type: 'slide',
          duration: 100,
          easing: 'easeInOutQuad',
          direction: 'both',
        }),
      )
      .pipe(Effect.runPromise);

  return {
    renderer,
    renderImage,
    animateTransition,
  };
};
