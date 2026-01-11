import { Duration, Effect } from 'effect';
import { CliOptions, build as electronBuild } from 'electron-builder';
import { BuildError } from './src/shared/core/utils/errors';

const build = (opts?: CliOptions) =>
  Effect.gen(function* () {
    yield* Effect.logInfo('Starting build process');

    const built = yield* Effect.tryPromise({
      try: async () =>
        electronBuild({
          ...opts,
          config: {
            appId: 'com.nova.app',
            productName: 'Nova',
            artifactName: '${productName}-{version}-${platform}-${arch}.${ext}',
            buildDependenciesFromSource: true,
            extraFiles: {
              from: 'drizzle/',
              to: 'drizzle/',
            },
            directories: {
              output: 'release/${version}',
            },
            mac: {
              target: 'dmg',
              hardenedRuntime: false,
              category: 'entertainment',
            },
            win: {
              icon: 'build/win.png',
              target: [
                {
                  target: 'msi',
                  arch: ['x64'],
                },
              ],
            },
            linux: {
              icon: 'build/win.png',
              target: [
                {
                  target: 'AppImage',
                  arch: ['x64'],
                },
              ],
              category: 'entertainment',
            },
            msi: {
              oneClick: true,
              perMachine: true,
              runAfterFinish: true,
              shortcutName: 'Nova',
            },
          },
        }),
      catch: (error) => new BuildError({ error }),
    }).pipe(Effect.flatMap((res) => Effect.succeed(res.join(','))));

    yield* Effect.logInfo(
      `Nova successfully Built, Artefacts saved at ${built.at(0)}`,
    );
  }).pipe(
    Effect.annotateLogs({
      process: 'nova.build',
    }),
    Effect.timed,
    Effect.tap(([duration]) =>
      Effect.logInfo(`Nova built in ${Duration.format(duration)}`),
    ),
  );

build().pipe(
  Effect.catchTag('BuildError', ({ error }) =>
    Effect.logFatal(
      // @ts-ignore: it's correctly typed
      `Build failed with Exit Code ${error.exitCode} ERROR CODE ==> ${error.code}...\n${error}`,
    ),
  ),
  Effect.runPromise,
);
