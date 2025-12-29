import type {
  ComicCache,
  MetadataSchema,
  cacheWorkerSchema,
  deletionWorkerSchema,
  dumpFileSchema,
  dumpSchema,
  fetchPagesResponseSchema,
  fetchPagesWorkerSchema,
  parserSchema,
  workerResponseSchema,
} from "@/shared/validations";
import type * as Schema from "effect/Schema";
import type z from "zod";
import type { collections, issues } from "./schema";

declare global {
  export type GlobalState = {
    colorMode: "dark" | "light";
    firstLaunch: boolean;
    isFullscreen: boolean;
    libraryView: "issues" | "collections";
    appId: string | null;
    reader: {
      direction: "horizontal" | "vertical";
    };
    lastOpenedTab: "issues" | "collections";
  };

  export type Issue = Omit<
    typeof issues.$inferSelect,
    "dateCreated" | "dateUpdated"
  > & {
    dateCreated: string | null;
    dateUpdated: string | null;
  };

  export type Collection = Omit<
    typeof collections.$inferSelect,
    "dateCreated" | "dateUpdated"
  > & {
    dateCreated: string | null;
    dateUpdated: string | null;
  };

  export type ParserResponse = {
    completed: boolean;
  };

  export type ParserErrorResponse = ParserResponse & {
    message: string;
  };

  export type ParserChannel = {
    completed?: number;
    total?: number;
    error: string | null;
    isCompleted?: boolean;
    state: "ERROR" | "SUCCESS";
    issue?: string;
  };

  export type DeletionChannel = {
    isDone: boolean;
    title?: string;
    error?: string | null;
  };

  export type Index = {
    index: Array<{
      path: string;
    }>;
  };

  export type ThemeSubscription = {
    theme: "dark" | "light";
  };

  export type Task = Readonly<{
    path: string;
    ext: "cbr" | "cbz" | "none";
  }>;

  export type DeeplinkChannel = {
    path: string;
  };

  export type DeeplinkListener = {
    exists: boolean;
    name: string;
  };

  export type Extractor = {
    name: string;
    isDir: boolean;
    data: ArrayBufferLike | undefined;
    isFirst: boolean;
  };

  export type ParserSchema = z.infer<typeof parserSchema>;
  export type WorkerResponse = z.infer<typeof workerResponseSchema>;
  export type DeletionSchema = z.infer<typeof deletionWorkerSchema>;
  export type CacheWorkerSchema = z.infer<typeof cacheWorkerSchema>;
  export type FetchPagesWorkerSchema = z.infer<typeof fetchPagesWorkerSchema>;
  export type FetchPagesResponseSchema = z.infer<
    typeof fetchPagesResponseSchema
  >;
  export type Metadata = Schema.Schema.Type<typeof MetadataSchema>;
  export type DumpFileSchema = Schema.Schema.Type<typeof dumpFileSchema>;
  export type DumpSchema = Schema.Schema.Type<typeof dumpSchema>;
  export type ComicCacheSchema = Schema.Schema.Type<typeof ComicCache>;
}
