import * as fs from 'node:fs';
import * as path from 'node:path';
import { NodeSink, NodeStream } from '@effect/platform-node';
import * as Chunk from 'effect/Chunk';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as Scope from 'effect/Scope';
import * as Stream from 'effect/Stream';
import * as yauzl from 'yauzl';

export class UnzipError extends Data.TaggedError('UnzipError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

type ZipEntry = Readonly<{
  fileName: string;
  isDirectory: boolean;
  uncompressedSize: number;
  readonly openContent: Effect.Effect<
    Stream.Stream<Uint8Array, UnzipError>,
    UnzipError
  >;
}>;

const openZipFile = (
  zipPath: string,
): Effect.Effect<yauzl.ZipFile, UnzipError, Scope.Scope> =>
  Effect.acquireRelease(
    Effect.async<yauzl.ZipFile, UnzipError>((resume) => {
      yauzl.open(
        zipPath,
        { lazyEntries: true, autoClose: true },
        (err, zipFile) => {
          if (err || !zipFile) {
            resume(
              Effect.fail(
                new UnzipError({ message: `Failed to open ${zipPath}` }),
              ),
            );
          } else {
            resume(Effect.succeed(zipFile));
          }
        },
      );
    }),
    (zipFile) => Effect.sync(() => zipFile.close()),
  );

const readNextEntry = (
  zipfile: yauzl.ZipFile,
): Effect.Effect<Option.Option<yauzl.Entry>, UnzipError> =>
  Effect.async<Option.Option<yauzl.Entry>, UnzipError>((resume) => {
    const onEntry = (entry: yauzl.Entry) => {
      cleanup();
      resume(Effect.succeed(Option.some(entry)));
    };
    const onEnd = () => {
      cleanup();
      resume(Effect.succeed(Option.none()));
    };
    const onError = (err: Error) => {
      cleanup();
      resume(
        Effect.fail(
          new UnzipError({
            message: 'Error reading zip entries',
            cause: err,
          }),
        ),
      );
    };
    const cleanup = () => {
      zipfile.removeListener('entry', onEntry);
      zipfile.removeListener('end', onEnd);
      zipfile.removeListener('error', onError);
    };

    zipfile.once('entry', onEntry);
    zipfile.once('end', onEnd);
    zipfile.once('error', onError);
    zipfile.readEntry();
  });

const openEntryContent = (
  zipfile: yauzl.ZipFile,
  entry: yauzl.Entry,
): Effect.Effect<Stream.Stream<Uint8Array, UnzipError>, UnzipError> =>
  Effect.async<Stream.Stream<Uint8Array, UnzipError>, UnzipError>((resume) => {
    zipfile.openReadStream(entry, (err, readable) => {
      if (err || !readable) {
        resume(
          Effect.fail(
            new UnzipError({
              message: `Failed to open stream for ${entry.fileName}`,
              cause: err,
            }),
          ),
        );
        return;
      }
      resume(
        Effect.succeed(
          NodeStream.fromReadable<UnzipError, Uint8Array>(
            () => readable,
            (cause) =>
              new UnzipError({
                message: `Read error on ${entry.fileName}`,
                cause,
              }),
          ),
        ),
      );
    });
  });

export const zipEntries = (
  zipPath: string,
): Stream.Stream<ZipEntry, UnzipError, Scope.Scope> =>
  Stream.unwrap(
    openZipFile(zipPath).pipe(
      Effect.map((zipfile) =>
        Stream.unfoldEffect(zipfile, (zf) =>
          readNextEntry(zf).pipe(
            Effect.map(Option.map((entry) => [entry, zf] as const)),
          ),
        ).pipe(
          Stream.map(
            (entry): ZipEntry => ({
              fileName: entry.fileName,
              isDirectory: /\/$/.test(entry.fileName),
              uncompressedSize: entry.uncompressedSize,
              openContent: openEntryContent(zipfile, entry),
            }),
          ),
        ),
      ),
    ),
  );

const writeEntryToDisk = (
  entry: ZipEntry,
  destDir: string,
): Effect.Effect<void, UnzipError> => {
  const targetPath = path.join(destDir, entry.fileName);

  if (entry.isDirectory) {
    return Effect.tryPromise({
      try: () => fs.promises.mkdir(targetPath, { recursive: true }),
      catch: (cause) =>
        new UnzipError({ message: `mkdir failed for ${targetPath}`, cause }),
    });
  }

  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () =>
        fs.promises.mkdir(path.dirname(targetPath), { recursive: true }),
      catch: (cause) =>
        new UnzipError({ message: `mkdir failed for ${targetPath}`, cause }),
    });

    const content = yield* entry.openContent;
    const sink = NodeSink.fromWritable<UnzipError, Uint8Array>(
      () => fs.createWriteStream(targetPath),
      (cause) =>
        new UnzipError({ message: `Write failed for ${targetPath}`, cause }),
    );

    yield* Stream.run(content, sink);
  });
};

export const extractZip = (
  zipPath: string,
  destDir: string,
): Effect.Effect<void, UnzipError> =>
  Effect.scoped(
    zipEntries(zipPath).pipe(
      Stream.mapEffect((entry) => writeEntryToDisk(entry, destDir), {
        concurrency: 1, // one entry's content stream open at a time -> bounded memory
      }),
      Stream.runDrain,
    ),
  );

const collectBytes = (
  content: Stream.Stream<Uint8Array, UnzipError>,
): Effect.Effect<Uint8Array, UnzipError> =>
  Stream.runFold(content, [] as Buffer[], (acc, chunk) => [
    ...acc,
    Buffer.from(chunk),
  ]).pipe(Effect.map((chunks) => Buffer.concat(chunks)));

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const METADATA_FILENAME = 'comicinfo.xml';

type CbzFile = {
  readonly fileName: string;
  readonly isFirst: boolean;
  readonly data: Uint8Array;
};

type CbzArchive = {
  readonly files: readonly CbzFile[];
  readonly meta: string;
};

export const readCbzArchive = (
  zipPath: string,
): Effect.Effect<CbzArchive, UnzipError> =>
  Effect.scoped(
    zipEntries(zipPath).pipe(
      Stream.filter((entry) => !entry.isDirectory),
      Stream.mapEffect(
        (entry) =>
          entry.openContent.pipe(
            Effect.flatMap(collectBytes),
            Effect.map((data) => ({ fileName: entry.fileName, data })),
          ),
        { concurrency: 1 }, // one entry materialized at a time
      ),
      Stream.runCollect,
    ),
  ).pipe(
    Effect.map((chunk) => {
      const all = Chunk.toReadonlyArray(chunk);

      const metaEntry = all.find(
        (f) => path.basename(f.fileName).toLowerCase() === METADATA_FILENAME,
      );

      const images = all
        .filter((f) =>
          IMAGE_EXTENSIONS.has(path.extname(f.fileName).toLowerCase()),
        )
        .sort((a, b) =>
          a.fileName.localeCompare(b.fileName, undefined, { numeric: true }),
        );

      const files: CbzFile[] = images.map((f, i) => ({
        fileName: f.fileName,
        isFirst: i === 0,
        data: f.data,
      }));

      const meta = metaEntry ? new TextDecoder().decode(metaEntry.data) : '';

      return { files, meta };
    }),
  );
