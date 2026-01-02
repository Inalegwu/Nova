import { Effect } from 'effect';
import * as NodeFS from 'node:fs';
import { join } from 'node:path';
import { FSError } from './core/utils/errors';
import { parseFileNameFromPath } from './utils';

type File = Uint8Array<ArrayBuffer>;

export namespace Fs {
  export const isDirectory = (path: string) =>
    Effect.async<boolean, FSError>((resume) =>
      NodeFS.stat(path, (cause, stats) => {
        if (cause)
          resume(
            Effect.fail(
              new FSError({
                cause,
                message: `Error checking ${path} was a directory`,
              }),
            ),
          );

        resume(Effect.succeed(stats.isDirectory()));
      }),
    );

  /**
   *
   * @param filePath: string
   * @returns Effect.Effect<string, FSError, never>
   *
   * read contents of a path
   */
  export const readFile = (path: string) =>
    Effect.async<File, FSError>((resume) =>
      NodeFS.readFile(path, undefined, (cause, data) => {
        if (cause)
          resume(
            Effect.fail(
              new FSError({
                cause,
                message: `Error occurred when reading file ${parseFileNameFromPath(
                  path,
                )}`,
              }),
            ),
          );

        resume(Effect.succeed(new Uint8Array(data)));
      }),
    );

  /**
   *
   * @param filePath: string
   * @returns Effect.Effect<string, FSError, never>
   *
   * read contents of a path
   */
  export const readFileString = (path: string) =>
    Effect.async<string, FSError>((resume) =>
      NodeFS.readFile(
        path,
        {
          encoding: 'utf-8',
        },
        (cause, data) => {
          if (cause)
            resume(
              Effect.fail(
                new FSError({
                  cause,
                  message: `Error when reading file ${parseFileNameFromPath(
                    path,
                  )}`,
                }),
              ),
            );
          resume(Effect.succeed(data));
        },
      ),
    );

  /**
   *
   * @param filePath: string
   * @returns Effect.Effect<void, FSError, never>
   *
   * Creates a new directory
   */
  export const makeDirectory = (filePath: string) =>
    Effect.async<void, FSError>((resume) =>
      NodeFS.mkdir(filePath, undefined, (error) => {
        if (error)
          resume(
            Effect.fail(
              new FSError({
                cause: error.cause,
                message: `Unable to make directory at path ${filePath}`,
              }),
            ),
          );

        resume(Effect.void);
      }),
    );

  /**
   *
   * @param filePath: string
   * @returns Effect.Effect<Array<string>, FSError, never>
   *
   * Read contents of a directory
   */
  export const readDirectory = (filePath: string) =>
    Effect.async<
      Array<{
        file: string;
        isDirectory: boolean;
      }>,
      FSError
    >((resume) =>
      NodeFS.readdir(
        filePath,
        {
          encoding: 'utf-8',
          recursive: true,
        },
        (error, files) => {
          if (error)
            resume(
              Effect.fail(
                new FSError({
                  cause: error.cause,
                  message: `Error when reading directory ${filePath}`,
                }),
              ),
            );

          resume(
            Effect.succeed(
              files.map((file) => ({
                file,
                isDirectory: NodeFS.statSync(
                  join(filePath, file),
                ).isDirectory(),
              })),
            ),
          );
        },
      ),
    );

  /**
   *
   * @param path: string
   * @param data: string | DataView<ArrayBufferLike>
   * @param opts: NodeFS.WriteFileOptions
   * @returns Effect.Effect<void, FSError, never>
   *
   * write data to a path
   */
  export const writeFile = (
    path: string,
    data: string | DataView<ArrayBufferLike>,
    opts: NodeFS.WriteFileOptions,
  ) =>
    Effect.async<void, FSError>((resume) =>
      NodeFS.writeFile(path, data, opts, (error) => {
        if (error)
          resume(
            Effect.fail(
              new FSError({
                cause: error,
                message: `Error when writing file to ${path}`,
              }),
            ),
          );

        resume(Effect.void);
      }),
    );

  /**
   *
   * @param filePath: string
   * @returns Effect.Effect<void, FSError, never>
   *
   * Recursively removes contents of a specified directory
   */
  export const removeDirectory = (filePath: string) =>
    Effect.async<void, FSError>((resume) =>
      NodeFS.rm(
        filePath,
        {
          recursive: true,
          maxRetries: 2,
        },
        (error) => {
          if (error)
            resume(
              Effect.fail(
                new FSError({
                  cause: error,
                  message: `Error occurred while removing ${filePath}`,
                }),
              ),
            );

          resume(Effect.void);
        },
      ),
    );
}
