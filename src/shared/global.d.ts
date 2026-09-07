import type * as Schema from 'effect/Schema';
import type React from 'react';
import type z from 'zod';
import type {
  ComicCache,
  cacheWorkerSchema,
  deletionWorkerSchema,
  dumpFileSchema,
  dumpSchema,
  fetchPagesResponseSchema,
  fetchPagesWorkerSchema,
  MetadataSchema,
  parserSchema,
  workerResponseSchema,
} from '@/shared/validations';
import type { collections, issues } from './schema';

declare global {
  type Tabs = 'issues' | 'collections';
  type Direction = 'horizontal' | 'vertical';

  export type GlobalState = {
    colorMode: 'dark' | 'light';
    firstLaunch: boolean;
    isFullscreen: boolean;
    appId: string | null;
    lastOpenedTab: Tabs;
    toggleColorMode: () => void;
    updateFirstLaunch: () => void;
    toggleFullScreen: () => void;
    setFullScreen: (value: boolean) => void;
    setAppId: (id: string) => void;
    clearAppId: () => void;
    setLastOpenedTab: (tab: Tabs) => void;
  };

  export type ReaderState = {
    direction: Direction;
    toggleReaderDirection: () => void;
    setReaderDirection: (direction: Direction) => void;
  };

  export type Issue = typeof issues.$inferSelect;

  export type Collection = typeof collections.$inferSelect;

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
    state: 'ERROR' | 'SUCCESS';
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
    theme: 'dark' | 'light';
  };

  // allow for a simple message and sub-message
  // view for some of the welcome pages but also
  // allow for more complex views to be rendered
  // within the welcome message
  export type WelcomeMessage = {
    id: number;
    title: string;
    subtitle?: string;
    render?: () => React.ReactNode;
  };

  export type Task = Readonly<{
    path: string;
    ext: 'cbr' | 'cbz' | 'none';
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
