import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { publicProcedure, router } from '@/trpc';
import { issues } from '../schema';
import db from '../storage';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const resolveIssuePages = async (issueId: string) => {
  const [issue] = await db
    .select({ path: issues.path })
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1);

  if (!issue) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `No issue ${issueId}` });
  }

  const entries = await readdir(issue.path);
  const fileNames = entries
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return { extractedPath: issue.path, fileNames };
};

export const pages = router({
  list: publicProcedure
    .input(z.object({ issueId: z.string() }))
    .query(async ({ input }) => {
      const { fileNames } = await resolveIssuePages(input.issueId);
      return fileNames.length;
    }),
  readPage: publicProcedure
    .input(
      z.object({
        issueId: z.string(),
        pageIndex: z.number().int().nonnegative(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const { extractedPath, fileNames } = await resolveIssuePages(
        input.issueId,
      );
      const fileName = fileNames[input.pageIndex];

      if (!fileName) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No page ${input.pageIndex} for issue ${input.issueId}`,
        });
      }

      const fileStream = createReadStream(path.join(extractedPath, fileName));
      signal?.addEventListener('abort', () => fileStream.destroy());

      try {
        for await (const chunk of fileStream) {
          yield new Uint8Array(chunk);
        }
      } finally {
        fileStream.destroy();
      }
    }),
});
