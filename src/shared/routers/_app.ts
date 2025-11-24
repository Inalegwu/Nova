import { publicProcedure, router } from "@/trpc";
import { observable } from "@trpc/server/observable";
import { deeplinkChannel, parserChannel, deletionChannel } from "../channels";
import { parseFileNameFromPath } from "../utils";
import { history } from "./history";
import issueRouter from "./issue";
import libraryRouter from "./library";
import { windowRouter } from "./window";
import { parser } from "../workers";

export const appRouter = router({
  window: windowRouter,
  issue: issueRouter,
  library: libraryRouter,
  history,
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
          parser.postMessage({
            parsePath: evt.path,
            action: "LINK",
          } satisfies ParserSchema);
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
});

export type AppRouter = typeof appRouter;
