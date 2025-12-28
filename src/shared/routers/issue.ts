import { publicProcedure, router } from "@/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { dialog } from "electron";
import path from "node:path";
import { v4 } from "uuid";
import z from "zod";
import { Fs } from "../fs";
import { issues as issuesSchema } from "../schema";
import { convertToImageUrl } from "../utils";
// @ts-ignore: https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes;
import deletionWorker from "../core/workers/deletion?nodeWorker";
// @ts-ignore: https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes;
import parseWorker from "../core/workers/parser?nodeWorker";

const issueRouter = router({
  addIssue: publicProcedure.mutation(async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: "Comic Book Archive", extensions: ["cbz", "cbr"] }],
      properties: ["multiSelections"],
    });

    if (canceled) {
      return {
        cancelled: true,
        completed: false,
      };
    }

    for (const parsePath of filePaths) {
      parseWorker({
        name: `parse-worker-${parsePath}`,
      })
        .on("message", console.log)
        .postMessage({
          parsePath,
          action: "LINK",
        } satisfies ParserSchema);
    }

    return {
      completed: true,
      cancelled: false,
    };
  }),
  deleteIssue: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      deletionWorker({
        name: "deletion-worker",
      }).postMessage({
        issueId: input.issueId,
      }),
    ),
  getPages: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const issue = await ctx.db.query.issues.findFirst({
        where: (issue, { eq }) => eq(issue.id, input.issueId),
        columns: {
          id: true,
          path: true,
        },
      });

      if (!issue)
        throw new TRPCError({
          message: "Issue doesn't exist",
          code: "NOT_FOUND",
        });

      const pages = await Fs.readDirectory(issue.path).pipe(
        Effect.map((files) => files.filter((file) => !file.isDirectory)),
        Effect.andThen((files) =>
          Effect.forEach(files, (file) =>
            Fs.readFile(path.join(issue.path, file.file)),
          ),
        ),
        Effect.map((files) =>
          files.map((file) => ({
            id: v4(),
            data: convertToImageUrl(file.buffer),
          })),
        ),
        Effect.runPromise,
      );

      return {
        pages,
      };
    }),
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
          code: "NOT_FOUND",
          cause: "Invalid or missing issueId",
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
          Effect.bind("result", () =>
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
