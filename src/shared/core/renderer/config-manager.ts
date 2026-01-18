import { Context, Effect, Layer, Ref, Schema } from 'effect';
import * as Types from './types';

export type ConfigManager = Readonly<{
  savePreset: (
    name: string,
    config: Types.RenderConfig,
  ) => Effect.Effect<void, Types.ImageError>;
  loadPreset: (
    name: string,
  ) => Effect.Effect<Types.RenderConfig, Types.ImageError>;
  deletePreset: (name: string) => Effect.Effect<void>;
  listPresets: Effect.Effect<string[]>;
  exportConfig: () => Effect.Effect<string>;
  importConfig: (
    json: string,
  ) => Effect.Effect<Types.RenderConfig, Types.ImageError>;
}>;

export const ConfigManager = Context.GenericTag<ConfigManager>(
  '@nova/renderer/ConfigManager',
);

export const makeConfigManager = Effect.gen(function* () {
  const presetsRef = yield* Ref.make(new Map<string, Types.RenderConfig>());

  const validateConfig = (config: unknown) =>
    Schema.decodeUnknown(Types.RenderConfigSchema)(config).pipe(
      Effect.mapError(
        (error) =>
          new Types.ImageError({
            message: `Invalid Config ${JSON.stringify(error)}`,
          }),
      ),
    );

  const savePreset: ConfigManager['savePreset'] = (name, config) =>
    Effect.gen(function* () {
      yield* validateConfig(config);
      yield* Ref.update(presetsRef, (map) => new Map(map).set(name, config));
    });

  const loadPreset: ConfigManager['loadPreset'] = (name) =>
    Effect.gen(function* () {
      const presets = yield* Ref.get(presetsRef);
      const preset = presets.get(name);

      if (!preset) {
        return yield* Effect.fail(
          new Types.ImageError({
            message: `Preset ${name} not found`,
          }),
        );
      }

      yield* Effect.logInfo(`loaded preset ${name}`);
      return preset;
    });

  const deletePreset: ConfigManager['deletePreset'] = (name) =>
    Effect.gen(function* () {
      yield* Ref.update(presetsRef, (map) => {
        const newMap = new Map(map);
        newMap.delete(name);
        return newMap;
      });
      yield* Effect.logInfo(`Deleted preset ${name}`);
    });

  const listPresets: ConfigManager['listPresets'] = Ref.get(presetsRef).pipe(
    Effect.map((map) => Array.from(map.keys())),
  );

  const exportConfig = () =>
    Ref.get(presetsRef).pipe(
      Effect.map((map) => JSON.stringify(Array.from(map.entries()), null, 2)),
    );

  const importConfig: ConfigManager['importConfig'] = (json) =>
    Effect.gen(function* () {
      const data = yield* Effect.try({
        try: () => JSON.parse(json),
        catch: (error) =>
          new Types.ImageError({
            message: `Invalid JSON: ${error}`,
          }),
      });

      if (!Array.isArray(data)) {
        return yield* Effect.fail(
          new Types.ImageError({
            message: 'Expected array of presets',
          }),
        );
      }

      for (const [name, config] of data) {
        yield* validateConfig(config);
        yield* Ref.update(presetsRef, (map) => new Map(map).set(name, config));
      }

      yield* Effect.logInfo(`Imported ${data.length} presets`);

      return new Types.RenderConfig({
        width: 800,
        height: 800,
        backgroundColor: '#000000',
        preserveAspectRatio: true,
        scaleMode: 'contain',
        filters: [],
      });
    });

  return {
    savePreset,
    loadPreset,
    deletePreset,
    listPresets,
    exportConfig,
    importConfig,
  } satisfies ConfigManager;
});

export const ConfigManagerLayer = Layer.effect(
  ConfigManager,
  makeConfigManager,
);
