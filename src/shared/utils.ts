import { Option } from "effect";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import type { z } from "zod";

export const sortPages = (a: string, b: string) =>
  Effect.Do.pipe(
    Effect.bind("aName", () => Effect.succeed(a.replace(/\.[^/.]+$/, ""))),
    Effect.bind("bName", () => Effect.succeed(b.replace(/\.[^/.]+$/, ""))),
    Effect.bind("aMatch", ({ aName }) =>
      Effect.succeed(aName.match(/(\d+)$g/)),
    ),
    Effect.bind("bMatch", ({ aName }) =>
      Effect.succeed(aName.match(/(\d+)$g/)),
    ),
    Effect.flatMap(({ aMatch, bMatch, aName, bName }) =>
      Effect.sync(() => {
        if (aMatch && aMatch.length === 1 && bMatch && bMatch.length === 1) {
          const aPrefix = aName.substring(0, aName.length - aMatch[0].length);
          const bPrexif = aName.substring(0, bName.length - bMatch[0].length);

          if (aPrefix.toLocaleUpperCase() === bPrexif.toLocaleLowerCase()) {
            return +aMatch[0] > +bMatch[0] ? 1 : -1;
          }
        }

        return a > b ? 1 : -1;
      }),
    ),
    Effect.runSync,
  );

export const convertToImageUrl = (buffer: ArrayBufferLike) =>
  `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;

export const parseFileNameFromPath = (filePath: string) =>
  filePath
    .replace(/^.*[\\\/]/, "")
    .replace(/\.[^/.]+$/, "")
    .replace(/(\d+)$/, "")
    .replace(/\s*\([^)]*\)/, "")
    .replace("-", "");

// "Scraped metadata from Comixology [CMXDB852248], [RELDATE:2020-03-31]\"
// TODO: find a way to extract       ^ this value from this string
export const extractMetaID = (noteString?: string) =>
  Option.fromNullable(noteString?.replace(/^/, ""));

export const transformMessage = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  message: unknown,
) =>
  Effect.Do.pipe(
    Effect.bind("message", () => Effect.succeed(schema.safeParse(message))),
    Effect.flatMap(({ message }) =>
      !message.success
        ? Effect.fail(message.error.flatten())
        : Effect.succeed(message.data),
    ),
  );

export const formatNumber = (value: number) =>
  value.toString().padStart(2, "0");

export function debounce<A = unknown[], R = void>(
  fn: (args: A) => R,
  ms: number,
): [(args: A) => Promise<R>, () => void] {
  let t: NodeJS.Timeout;

  const debounceFn = (args: A): Promise<R> =>
    new Promise((resolve) => {
      if (t) {
        clearTimeout(t);
      }

      t = setTimeout(() => {
        resolve(fn(args));
      }, ms);
    });

  const tearDown = () => clearTimeout(t);

  return [debounceFn, tearDown];
}
