import type { BroadcastChannel, EventContext } from 'broadcast-channel';
import { Option } from 'effect';
import * as Effect from 'effect/Effect';
import type { z } from 'zod';

export const sortPages = (a: string, b: string) =>
  Effect.Do.pipe(
    Effect.bind('aName', () => Effect.succeed(a.replace(/\.[^/.]+$/, ''))),
    Effect.bind('bName', () => Effect.succeed(b.replace(/\.[^/.]+$/, ''))),
    Effect.bind('aMatch', ({ aName }) =>
      Effect.succeed(aName.match(/(\d+)$g/)),
    ),
    Effect.bind('bMatch', ({ aName }) =>
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
  `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;

export const parseFileNameFromPath = (filePath: string) =>
  filePath
    .replace(/^.*[\\/]/, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/(\d+)$/, '')
    .replace(/\s*\([^)]*\)/, '')
    .replace('-', '');

// "Scraped metadata from Comixology [CMXDB852248], [RELDATE:2020-03-31]\"
// TODO: find a way to extract       ^ this value from this string
export const extractMetaID = (noteString?: string) =>
  Option.fromNullable(noteString?.replace(/^/, ''));

export const transformMessage = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  message: unknown,
) =>
  Effect.Do.pipe(
    Effect.bind('message', () => Effect.succeed(schema.safeParse(message))),
    Effect.flatMap(({ message }) =>
      !message.success
        ? Effect.fail(message.error.flatten())
        : Effect.succeed(message.data),
    ),
  );

export const formatNumber = (value: number) =>
  value.toString().padStart(2, '0');

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

/**
 * Bridges an EventTarget-like channel (addEventListener/removeEventListener)
 * into an AsyncIterable so it can be consumed with `for await`.
 * Cleans up automatically when the client unsubscribes (signal aborts).
 */
export function channelToAsyncIterable<T>(
  channel: BroadcastChannel<T>,
  event: string,
  signal?: AbortSignal,
  onCleanup?: () => void | Promise<void>,
): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const queue: T[] = [];
      const pending: ((result: IteratorResult<T>) => void)[] = [];
      let done = false;

      const listener = (data: T) => {
        if (pending.length > 0) {
          pending.shift()!({ value: data, done: false });
        } else {
          queue.push(data);
        }
      };

      const cleanup = () => {
        if (done) return;
        done = true;
        channel.removeEventListener(event as EventContext, listener);
        for (const resolve of pending.splice(0)) {
          resolve({ value: undefined as never, done: true });
        }
        void onCleanup?.();
      };

      channel.addEventListener(event as EventContext, listener);
      signal?.addEventListener('abort', cleanup, { once: true });

      return {
        next: () => {
          if (queue.length > 0) {
            return Promise.resolve({ value: queue.shift()!, done: false });
          }
          if (done) {
            return Promise.resolve({ value: undefined as never, done: true });
          }
          return new Promise<IteratorResult<T>>((resolve) =>
            pending.push(resolve),
          );
        },
        return: () => {
          cleanup();
          return Promise.resolve({ value: undefined as never, done: true });
        },
      };
    },
  };
}
