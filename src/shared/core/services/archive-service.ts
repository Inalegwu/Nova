import path from 'node:path';
import { Console, Effect } from 'effect';
import { parserChannel } from '../../channels';
import { Fs } from '../../fs';
import { convertToImageUrl, parseFileNameFromPath } from '../../utils';
import * as Archive from '../archive/index';
import { createRarExtractor, saveIssue } from '../utils/functions';

export class ArchiveService extends Effect.Service<ArchiveService>()(
  'ArchiveService',
  {
    effect: Effect.gen(function* () {
      return {
        rar: Effect.fnUntraced(function* (filePath: string) {
          const { files } = yield* createRarExtractor(filePath);

          const issueTitle = yield* Effect.sync(() =>
            parseFileNameFromPath(filePath),
          );

          const savePath = path.join(process.env.cache_dir!, issueTitle);

          yield* Effect.logInfo(issueTitle, savePath);

          const thumbnailUrl = yield* Effect.sync(() =>
            convertToImageUrl(files.find((file) => file.isFirst)?.data!),
          );

          yield* saveIssue(issueTitle, thumbnailUrl, savePath);

          // yield* parseXML(meta, newIssue.id).pipe(
          //   Effect.fork,
          //   Effect.catchAll(Effect.logFatal),
          // );

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
          const { files } = yield* Archive.cbz.readCbzArchive(zipPath);

          const issueTitle = yield* Effect.sync(() =>
            parseFileNameFromPath(zipPath),
          );
          const savePath = path.join(process.env.cache_dir!, issueTitle);

          const thumbnailUrl = yield* Effect.sync(() =>
            convertToImageUrl(
              Buffer.from(files.find((f) => f.isFirst)?.data!).buffer,
            ),
          );

          yield* saveIssue(issueTitle, thumbnailUrl, savePath);

          yield* Archive.cbz.extractZip(zipPath, savePath);

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
    }),
  },
) {}
