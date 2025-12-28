import { parserChannel } from "../../channels";
import { Fs } from "../../fs";
import { issues, metadata } from "../../schema";
import db from "../../storage";
import { extractMetaID, parseFileNameFromPath, sortPages } from "../../utils";
import Zip from "adm-zip";
import { Array, Effect, Option, Schema } from "effect";
import { XMLParser } from "fast-xml-parser";
import { createExtractorFromData } from "node-unrar-js";
import { v4 } from "uuid";
import { MetadataSchema } from "../../validations";
import { ArchiveError } from "./errors";

export const parseXML = Effect.fn(function* (
  file: Option.Option<Extractor>,
  issueId: string,
) {
  const xmlParser = new XMLParser();

  const data = Option.getOrUndefined(file);

  if (!data) return;

  const { metadata: meta, metaId } = yield* Effect.sync(() =>
    xmlParser.parse(Buffer.from(data.data!).toString()),
  ).pipe(
    Effect.andThen((file) =>
      Schema.decodeUnknown(MetadataSchema)(file.comicInfo, {
        onExcessProperty: "ignore",
        exact: false,
      }),
    ),
    Effect.map((metadata) => ({
      metadata,
      metaId: extractMetaID(metadata.Notes).pipe(Option.getOrUndefined),
    })),
  );

  yield* Effect.logInfo({ meta, metaId });

  yield* Effect.tryPromise(
    async () =>
      await db.insert(metadata).values({
        id: v4(),
        issueId,
        ...meta,
      }),
  );
});

export const saveIssue = Effect.fn(function* (
  issueTitle: string,
  thumbnailUrl: string,
  path: string,
) {
  const _ = yield* Effect.tryPromise(
    async () => await db.query.issues.findMany({}),
  ).pipe(
    Effect.flatMap((result) =>
      Effect.succeed(result.map((res) => res.issueTitle)),
    ),
  );

  yield* Effect.log(_);

  const newIssue = yield* Effect.tryPromise(
    async () =>
      await db
        .insert(issues)
        .values({
          id: v4(),
          issueTitle,
          thumbnailUrl,
          path,
        })
        .returning(),
  ).pipe(Effect.map((result) => result.at(0)));

  if (!newIssue) {
    parserChannel.postMessage({
      isCompleted: true,
      error: "Couldn't save Issue",
      state: "ERROR",
      issue: parseFileNameFromPath(path),
    });
    return yield* Effect.die(
      new ArchiveError({ cause: "Unable to Save Issue" }),
    );
  }

  return newIssue;
});

export const createRarExtractor = Effect.fn(function* (filePath: string) {
  const wasmBinary = yield* Fs.readFile(
    require.resolve("node-unrar-js/dist/js/unrar.wasm"),
  ).pipe(Effect.andThen((binary) => binary.buffer));

  return yield* Fs.readFile(filePath).pipe(
    Effect.map((file) => file.buffer),
    Effect.andThen((data) =>
      Effect.tryPromise(
        async () =>
          await createExtractorFromData({
            data,
            wasmBinary,
          }),
      ),
    ),
    Effect.andThen((extractor) =>
      Effect.try(() =>
        extractor.extract({
          files: [...extractor.getFileList().fileHeaders].map(
            (header) => header.name,
          ),
        }),
      ),
    ),
    Effect.map((extracted) =>
      Array.fromIterable(extracted.files)
        .sort((a, b) => sortPages(a.fileHeader.name, b.fileHeader.name))
        .filter((file) => !file.fileHeader.flags.directory),
    ),
    Effect.andThen((extracted) =>
      extracted.map(
        (file) =>
          ({
            name: file.fileHeader.name,
            isDir: file.fileHeader.flags.directory,
            data: file.extraction?.buffer,
          }) satisfies Extractor,
      ),
    ),
    Effect.map((files) => ({
      meta: Option.fromNullable(
        files.find((file) => file.name.includes(".xml")),
      ),
      files: files
        .filter((file) => !file.name.includes(".xml"))
        .filter((file) => !file.isDir),
    })),
  );
});

export const createZipExtractor = (filePath: string) =>
  Fs.readFile(filePath).pipe(
    Effect.map((buff) => new Zip(Buffer.from(buff.buffer))),
    Effect.map((zip) =>
      zip
        .getEntries()
        .sort((a, b) => sortPages(a.name, b.name))
        .map(
          (entry) =>
            ({
              name: entry.name,
              data: entry.getData().buffer,
              isDir: entry.isDirectory,
            }) satisfies Extractor,
        ),
    ),
    Effect.map((files) => ({
      meta: Option.fromNullable(
        files.find((file) => file.name.includes(".xml")),
      ),
      files: files
        .filter((file) => !file.name.includes(".xmk"))
        .filter((file) => !file.isDir),
    })),
  );
