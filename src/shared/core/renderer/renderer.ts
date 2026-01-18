import { Context, Effect, Layer, Option, Ref } from 'effect';
import { AnimationEngine, AnimationEngineLayer } from './animation-engine';
import { ImageLoader, ImageLoaderLayer } from './image-loader';
import * as Types from './types';

export type ImageRenderer = Readonly<{
  initialize: (canvasId: string) => Effect.Effect<void, Types.CanvasError>;
  renderImage: (
    source: Types.ImageSource,
    config?: Partial<Types.RenderConfig>,
  ) => Effect.Effect<void, Types.CanvasError | Types.ImageError>;
  animateTransition: (
    from: Types.ImageSource,
    to: Types.ImageSource,
    animation: Types.AnimationConfig,
    config?: Partial<Types.RenderConfig>,
  ) => Effect.Effect<
    void,
    Types.CanvasError | Types.ImageError | Types.AnimationError
  >;
  applyFilter: (
    filter: Types.ImageFilter,
  ) => Effect.Effect<void, Types.CanvasError | Types.ImageError>;
  updateConfig: (
    config: Partial<Types.RenderConfig>,
  ) => Effect.Effect<void, Types.CanvasError | Types.ImageError>;
  getCurrentState: Effect.Effect<RendererState>;
  // takeScreenshot: (
  //   format?: 'png' | 'jpeg',
  //   quality?: number,
  // ) => Effect.Effect<string, Types.CanvasError>;
}>;

export type RendererState = {
  currentImage: Option.Option<Types.ImageSource>;
  currentConfig: Types.RenderConfig;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
};

export const ImageRenderer = Context.GenericTag<ImageRenderer>(
  '@nova/renderer/ImageRenderer',
);

// ========== Implementation ==========
const makeImageRenderer = Effect.gen(function* (_) {
  const imageLoader = yield* ImageLoader;
  const animationEngine = yield* AnimationEngine;

  const stateRef = yield* Ref.make<RendererState>({
    currentImage: Option.none(),
    currentConfig: new Types.RenderConfig({
      width: 800,
      height: 600,
      backgroundColor: '#000000',
      preserveAspectRatio: true,
      scaleMode: 'contain',
      filters: [],
    }),
    canvas: null,
    context: null,
  });

  // Helper: Validate and merge config
  const mergeConfig = (
    base: Types.RenderConfig,
    updates: Partial<Types.RenderConfig>,
  ): Types.RenderConfig =>
    new Types.RenderConfig({
      ...base,
      ...updates,
    });

  // Helper: Calculate image dimensions based on scale mode
  const calculateDimensions = (
    imgWidth: number,
    imgHeight: number,
    config: Types.RenderConfig,
  ): { x: number; y: number; width: number; height: number } => {
    const { width: canvasWidth, height: canvasHeight, scaleMode } = config;

    switch (scaleMode) {
      case 'stretch':
        return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };

      case 'contain': {
        const scale = Math.min(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;
        return { x, y, width, height };
      }

      case 'cover': {
        const scale = Math.max(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;
        return { x, y, width, height };
      }
    }
  };

  // Helper: Apply filters to context
  const applyFilters = (
    context: CanvasRenderingContext2D,
    filters: Types.ImageFilter[],
  ) => {
    const filterString = filters
      .map((filter) => {
        switch (filter.type) {
          case 'brightness':
            return `brightness(${filter.value})`;
          case 'contrast':
            return `contrast(${filter.value})`;
          case 'saturation':
            return `saturate(${filter.value})`;
          case 'grayscale':
            return `grayscale(${filter.value})`;
          case 'blur':
            return `blur(${filter.value}px)`;
        }
      })
      .join(' ');

    context.filter = filterString;
  };

  const initialize = (canvasId: string) =>
    Effect.gen(function* (_) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        return yield* Effect.fail(
          new Types.CanvasError({
            message: `Canvas with id "${canvasId}" not found`,
          }),
        );
      }

      const context = canvas.getContext('2d');
      if (!context) {
        return yield* Effect.fail(
          new Types.CanvasError({
            message: 'Failed to get 2D context',
          }),
        );
      }

      yield* _(
        Ref.update(stateRef, (state) => ({
          ...state,
          canvas,
          context,
        })),
      );

      yield* _(Effect.logInfo(`Canvas initialized: ${canvasId}`));
    });

  const renderImage: ImageRenderer['renderImage'] = (source, config) =>
    Effect.gen(function* (_) {
      const state = yield* Ref.get(stateRef);

      if (!state.context || !state.canvas) {
        return yield* Effect.fail(
          new Types.CanvasError({
            message: 'Canvas not initialized',
          }),
        );
      }

      // Merge config updates
      const mergedConfig = config
        ? mergeConfig(state.currentConfig, config)
        : state.currentConfig;

      // Update state
      yield* _(
        Ref.update(stateRef, (state) => ({
          ...state,
          currentImage: Option.some(source),
          currentConfig: mergedConfig,
        })),
      );

      // Load image
      const img = yield* _(imageLoader.load(source));

      // Clear canvas
      const { context, canvas } = state;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = mergedConfig.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Apply filters
      applyFilters(context, mergedConfig.filters);

      // Calculate dimensions
      const { x, y, width, height } = calculateDimensions(
        img.width,
        img.height,
        mergedConfig,
      );

      // Draw image
      context.drawImage(img, x, y, width, height);

      yield* _(Effect.logInfo(`Rendered image: ${source.url}`));
    });

  const animateTransition: ImageRenderer['animateTransition'] = (
    from,
    to,
    animation,
    config,
  ) =>
    Effect.gen(function* (_) {
      const state = yield* _(Ref.get(stateRef));

      if (!state.context || !state.canvas) {
        return yield* Effect.fail(
          new Types.CanvasError({
            message: 'Canvas not initialized',
          }),
        );
      }

      // Merge config updates
      const mergedConfig = config
        ? mergeConfig(state.currentConfig, config)
        : state.currentConfig;

      // Preload both images
      const [fromImg, toImg] = yield* _(imageLoader.preload([from, to]));

      yield* _(Effect.logInfo(`Starting animation: ${animation.type}`));

      // Start animation
      yield* animationEngine.startAnimation(animation, (progress) =>
        Effect.gen(function* (_) {
          const { context, canvas } = state;

          // Clear canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = mergedConfig.backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Apply filters
          applyFilters(context, mergedConfig.filters);

          // Calculate dimensions for both images
          const fromDims = calculateDimensions(
            fromImg.width,
            fromImg.height,
            mergedConfig,
          );

          const toDims = calculateDimensions(
            toImg.width,
            toImg.height,
            mergedConfig,
          );

          // Apply animation based on type
          switch (animation.type) {
            case 'fade':
              // Draw old image with decreasing opacity
              context.globalAlpha = 1 - progress;
              context.drawImage(
                fromImg,
                fromDims.x,
                fromDims.y,
                fromDims.width,
                fromDims.height,
              );

              // Draw new image with increasing opacity
              context.globalAlpha = progress;
              context.drawImage(
                toImg,
                toDims.x,
                toDims.y,
                toDims.width,
                toDims.height,
              );
              break;

            case 'slide':
              // Calculate slide offset
              const slideX = canvas.width * progress;

              // Draw old image sliding out
              context.drawImage(
                fromImg,
                fromDims.x - slideX,
                fromDims.y,
                fromDims.width,
                fromDims.height,
              );

              // Draw new image sliding in
              context.drawImage(
                toImg,
                toDims.x + (canvas.width - slideX),
                toDims.y,
                toDims.width,
                toDims.height,
              );
              break;

            case 'crossfade':
              // Both images at same position, crossfading
              context.globalAlpha = 1 - progress;
              context.drawImage(
                fromImg,
                fromDims.x,
                fromDims.y,
                fromDims.width,
                fromDims.height,
              );

              context.globalAlpha = progress;
              context.drawImage(
                toImg,
                fromDims.x,
                fromDims.y,
                fromDims.width,
                fromDims.height,
              );
              break;
          }

          // Reset global alpha
          context.globalAlpha = 1;
        }),
      );

      // Update state after animation
      yield* _(
        Ref.update(stateRef, (state) => ({
          ...state,
          currentImage: Option.some(to),
          currentConfig: mergedConfig,
        })),
      );
    });

  const applyFilter = (filter: Types.ImageFilter) =>
    Effect.gen(function* (_) {
      const state = yield* _(Ref.get(stateRef));

      yield* Ref.update(stateRef, (state) => {
        const filters = [...state.currentConfig.filters, filter];
        return {
          ...state,
          currentConfig: new Types.RenderConfig({
            ...state.currentConfig,
            filters,
          }),
        };
      });

      // Re-render current image with new filter
      const currentImage = Option.getOrElse(state.currentImage, () => null);
      if (currentImage) {
        yield* renderImage(currentImage);
      }
    });

  const updateConfig = (config: Partial<Types.RenderConfig>) =>
    Effect.gen(function* (_) {
      yield* Ref.update(stateRef, (state) => ({
        ...state,
        currentConfig: mergeConfig(state.currentConfig, config),
      }));

      // Re-render if there's a current image
      const updatedState = yield* _(Ref.get(stateRef));
      if (Option.isSome(updatedState.currentImage)) {
        yield* renderImage(updatedState.currentImage.value);
      }
    });

  const getCurrentState = Ref.get(stateRef);

  return {
    initialize,
    renderImage,
    animateTransition,
    applyFilter,
    updateConfig,
    getCurrentState,
  } satisfies ImageRenderer;
});

// ========== Layer ==========
export const ImageRendererLayer = Layer.effect(
  ImageRenderer,
  makeImageRenderer,
).pipe(Layer.provide(ImageLoaderLayer), Layer.provide(AnimationEngineLayer));
