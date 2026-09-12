import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { Console, Effect } from 'effect';
import { dialog } from 'electron';
import z from 'zod';
import { publicProcedure, router } from '@/trpc';
import { DiscoveryChannel } from '@/workers/channel';
// @ts-expect-error: https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes;
import deletionWorker from '../core/workers/deletion?nodeWorker';
import { issues as issuesSchema } from '../schema';
import { parseFileNameFromPath } from '../utils';

const issueRouter = router({
  addIssue: publicProcedure.mutation(async () =>
    Effect.gen(function* () {
      const channel = yield* DiscoveryChannel;

      const { canceled, filePaths } = yield* Effect.tryPromise(
        async () =>
          await dialog.showOpenDialog({
            filters: [
              {
                name: 'Comic Book Archive',
                extensions: ['cbz', 'cbr', 'zip', 'rar'],
              },
            ],
            properties: ['multiSelections'],
          }),
      );

      if (canceled) {
        return yield* Effect.succeed({
          cancelled: true,
          completed: false,
        });
      }

      yield* Effect.log({ filePaths });
      yield* Effect.forEach(filePaths, (path) =>
        channel
          .publish({
            discoveredAt: Date.now(),
            name: parseFileNameFromPath(path),
            path,
          })
          .pipe(
            Effect.catchAll((e) =>
              Console.error(`failed to broadcast ${path}`, e.cause),
            ),
          ),
      );
    }).pipe(Effect.provide(DiscoveryChannel.Default), Effect.runPromise),
  ),
  deleteIssue: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
      }),
    )
    .mutation(async ({ input }) =>
      deletionWorker({
        name: 'deletion-worker',
      }).postMessage({
        issueId: input.issueId,
      }),
    ),
  getIssue: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const issue = await ctx.db.query.issues.findFirst({
        where: (issues, { eq }) => eq(issues.id, input.issueId),
      });

      if (!issue)
        throw new TRPCError({
          message: "Couldn't find issue",
          code: 'NOT_FOUND',
          cause: 'Invalid or missing issueId',
        });

      const metadata = await ctx.db.query.metadata.findFirst({
        where: (meta, { eq }) => eq(meta.issueId, issue.id),
      });

      return {
        issue,
        metadata,
      };
    }),
  editIssueTitle: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
        issueTitle: z.string(),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await Effect.Do.pipe(
          Effect.bind('result', () =>
            Effect.tryPromise(
              async () =>
                await ctx.db
                  .update(issuesSchema)
                  .set({
                    issueTitle: input.issueTitle,
                  })
                  .where(eq(issuesSchema.id, input.issueId))
                  .returning(),
            ),
          ),
          Effect.flatMap(({ result }) =>
            Effect.succeed({
              result: result.at(0),
            }),
          ),
          Effect.runPromise,
        ),
    ),
});

export default issueRouter;
