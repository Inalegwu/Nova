import { Duration, Effect } from "effect";
import { build } from "electron-builder";
import { BuildError } from "./src/shared/core/utils/errors";

Effect.tryPromise({
  try: async () =>
    await build({
      config: {
        appId: "com.vision.app",
        productName: "Vision",
        artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
        buildDependenciesFromSource: true,
        files: ["out/**/*"],
        extraFiles: {
          from: "drizzle/",
          to: "drizzle/",
        },
        extraResources: {
          from: "drizzle/",
          to: "drizzle/",
        },
        directories: {
          output: "release/${version}",
        },
        mac: {
          target: ["dmg"],
          hardenedRuntime: true,
          category: "entertaiment",
        },
        win: {
          icon: "build/win.png",
          target: [
            {
              target: "msi",
              arch: ["x64"],
            },
          ],
        },
        linux: {
          icon: "build/win.png",
          target: [
            {
              target: "AppImage",
            },
          ],
          category: "entertainment",
        },
        msi: {
          oneClick: true,
          perMachine: true,
          runAfterFinish: true,
        },
      },
    }).then((paths) => paths.join(",")),
  catch: (error) => new BuildError({ error }),
}).pipe(
  Effect.andThen((paths) => Effect.logInfo(`Built executable @ ${paths}`)),
  Effect.catchTags({
    BuildError: ({ error }) =>
      Effect.logFatal(
        // @ts-ignore: it's correctly typed
        `Build failed with Exit Code ${error.exitCode} ERROR CODE ==> ${error.code}...\n${error}`,
      ),
  }),
  Effect.timed,
  Effect.tap(([duration]) =>
    Effect.logInfo(`Build took ${Duration.format(duration)}`),
  ),
  Effect.withLogSpan("app.build"),
  Effect.annotateLogs({
    script: "app.build",
  }),
  Effect.runPromise,
);
