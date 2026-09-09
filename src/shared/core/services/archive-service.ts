import path from 'node:path';
import { Console, Context, Effect } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { parserChannel } from '../../channels';
import { Fs } from '../../fs';
import { convertToImageUrl, parseFileNameFromPath } from '../../utils';
import * as Archive from '../archive/index';
import type { FSError } from '../utils/errors';
import { createRarExtractor, parseXML, saveIssue } from '../utils/functions';

export type IArchiveService = {
  rar: (filePath: string) => Effect.Effect<void, FSError | UnknownException>;
  zip: (filePath: string) => Effect.Effect<void, FSError | UnknownException>;
};

// TODO: implement fallbacks for when the database archive service fails
// or isn't properly implemented (future stuff)
export class ArchiveService extends Context.Tag('@nova/Core/Services/Archive')<
  ArchiveService,
  IArchiveService
>() {}

export const databaseArchiveService = {
  rar: Effect.fnUntraced(function* (filePath: string) {
    const { files, meta } = yield* createRarExtractor(filePath);

    const issueTitle = yield* Effect.sync(() =>
      parseFileNameFromPath(filePath),
    );

    const savePath = path.join(process.env.cache_dir!, issueTitle);

    yield* Effect.logInfo(issueTitle, savePath);

    const thumbnailUrl = yield* Effect.sync(() =>
      convertToImageUrl(files.find((file) => file.isFirst)?.data!),
    );

    const newIssue = yield* saveIssue(issueTitle, thumbnailUrl, savePath);

    yield* parseXML(meta, newIssue.id).pipe(
      Effect.fork,
      Effect.catchAll(Effect.logFatal),
    );

    yield* Fs.makeDirectory(savePath).pipe(
      Effect.catchTag('FSError', Console.log),
    );

    yield* Effect.forEach(files, (file) =>
      Fs.writeFile(
        path.join(savePath, file.name),
        Buffer.from(file.data!).toString('base64'),
        {
          encoding: 'base64',
        },
      ).pipe(Effect.catchTag('FSError', Console.log)),
    );

    yield* Effect.sync(() =>
      parserChannel.postMessage({
        state: 'SUCCESS',
        isCompleted: true,
        error: null,
        issue: issueTitle,
      }),
    );
  }),
  zip: Effect.fnUntraced(function* (zipPath: string) {
    const { files, meta } = yield* Archive.cbz.readCbzArchive(zipPath);

    const issueTitle = yield* Effect.sync(() => parseFileNameFromPath(zipPath));
    const savePath = path.join(process.env.cache_dir!, issueTitle);

    const thumbnailUrl = yield* Effect.sync(() =>
      convertToImageUrl(
        Buffer.from(files.find((f) => f.isFirst)?.data!).buffer,
      ),
    );

    const newIssue = yield* saveIssue(issueTitle, thumbnailUrl, savePath);

    yield* parseXML(meta, newIssue.id).pipe(
      Effect.fork,
      Effect.catchAll(Effect.logFatal),
    );

    yield* Effect.sync(() =>
      parserChannel.postMessage({
        state: 'SUCCESS',
        isCompleted: true,
        error: null,
        issue: issueTitle,
      }),
    );
  }),
};
