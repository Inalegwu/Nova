import { Effect, Layer, pipe } from 'effect';
import { ConfigManager, ConfigManagerLayer } from './config-manager';
import { ImageRenderer, ImageRendererLayer } from './renderer';
import * as Types from './types';

const AppLayer = Layer.mergeAll(ImageRendererLayer, ConfigManagerLayer);

const presets = {
  default: new Types.RenderConfig({
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    preserveAspectRatio: true,
    scaleMode: 'contain',
    filters: [],
  }),
  dark: new Types.RenderConfig({
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    preserveAspectRatio: true,
    scaleMode: 'cover',
    filters: [
      new Types.ImageFilter({ type: 'brightness', value: 0.9 }),
      new Types.ImageFilter({ type: 'contrast', value: 1.1 }),
    ],
  }),
  vintage: new Types.RenderConfig({
    width: 800,
    height: 600,
    backgroundColor: '#f0e6d6',
    preserveAspectRatio: false,
    scaleMode: 'stretch',
    filters: [
      new Types.ImageFilter({ type: 'grayscale', value: 0.3 }),
      new Types.ImageFilter({ type: 'saturation', value: 0.8 }),
    ],
  }),
};

const setupUI = (renderer: ImageRenderer, configManager: ConfigManager) =>
  Effect.gen(function* () {
    yield* renderer.initialize('readerRenderer');

    for (const [name, preset] of Object.entries(presets)) {
      yield* configManager.savePreset(name, preset);
    }
  });

const main = Effect.gen(function* () {
  const renderer = yield* ImageRenderer;
  const configManager = yield* ConfigManager;

  yield* setupUI(renderer, configManager);

  yield* Effect.logInfo('starting renderer');
});

export const runnable = pipe(
  main,
  Effect.provide(AppLayer),
  Effect.tapError((error) =>
    Effect.sync(() => {
      console.error(`Application error ${error.message}`);
    }),
  ),
  Effect.runSync,
);
