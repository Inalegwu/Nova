import { publicProcedure, router } from "@/trpc";
import { observable } from "@trpc/server/observable";
import { deeplinkChannel, deletionChannel, parserChannel } from "../channels";
import { comicVineClient } from "../core/services/metadata-service";
import { parseFileNameFromPath } from "../utils";
import issueRouter from "./issue";
import libraryRouter from "./library";
import { windowRouter } from "./window";

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  deeplink: publicProcedure.subscription(({ ctx }) =>
    observable<{
      issueId: string;
    }>((emit) => {
      const listener = async (evt: DeeplinkChannel) => {
        const exists = await ctx.db.query.issues.findFirst({
          where: (fields, { eq }) =>
            eq(fields.issueTitle, parseFileNameFromPath(evt.path)),
          columns: {
            id: true,
          },
        });

        if (!exists) {
          console.log("not previously saved");
          return;
        }

        emit.next({
          issueId: exists.id,
        });
      };

      deeplinkChannel.addEventListener("message", listener);

      return () => {
        deeplinkChannel.removeEventListener("message", listener);
      };
    }),
  ),
  additions: publicProcedure.subscription(() =>
    observable<ParserChannel>((emit) => {
      const listener = (evt: ParserChannel) => {
        emit.next(evt);
      };

      parserChannel.addEventListener("message", listener);

      return () => {
        parserChannel.removeEventListener("message", listener);
      };
    }),
  ),
  deletions: publicProcedure.subscription(() =>
    observable<DeletionChannel>((emit) => {
      const listener = (event: DeletionChannel) => {
        emit.next(event);
      };

      deletionChannel.addEventListener("message", listener);

      return () => {
        deletionChannel.removeEventListener("message", listener);
      };
    }),
  ),
  testMeta: publicProcedure.query(async () => {
    const result = await comicVineClient.character.retrieve(1443, {
      priority: "user",
    });

    console.log(result);

    return result;
  }),
});

export type AppRouter = typeof appRouter;
