import type * as Schema from 'effect/Schema';
import type React from 'react';
import type z from 'zod';
import type {
  ComicCache,
  cacheWorkerSchema,
  deletionWorkerSchema,
  dumpFileSchema,
  dumpSchema,
  MetadataSchema,
} from '@/shared/validations';
import type { collections, issues } from './schema';

declare global {
  type Direction = 'horizontal' | 'vertical';

  export type GlobalState = {
    colorMode: 'dark' | 'light';
    firstLaunch: boolean;
    appId: string | null;
    toggleColorMode: () => void;
    updateFirstLaunch: () => void;
    setAppId: (id: string) => void;
    clearAppId: () => void;
  };

  export type ReaderState = {
    direction: Direction;
    toggleReaderDirection: () => void;
    setReaderDirection: (direction: Direction) => void;
  };

  export type Issue = Omit<
    typeof issues.$inferSelect,
    'dateCreated' | 'dateUpdated'
  > & {
    dateCreated: string;
    dateUpdated: string;
  };

  export type Collection = Omit<
    typeof collections.$inferSelect,
    'dateCreated' | 'dateUpdated'
  > & {
    dateCreated: string;
    dateUpdated: string;
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

  export type Extractor = {
    name: string;
    isDir: boolean;
    data: ArrayBufferLike | undefined;
    isFirst: boolean;
  };

  export type DeletionSchema = z.infer<typeof deletionWorkerSchema>;
  export type CacheWorkerSchema = z.infer<typeof cacheWorkerSchema>;
  export type Metadata = Schema.Schema.Type<typeof MetadataSchema>;
  export type DumpFileSchema = Schema.Schema.Type<typeof dumpFileSchema>;
  export type DumpSchema = Schema.Schema.Type<typeof dumpSchema>;
  export type ComicCacheSchema = Schema.Schema.Type<typeof ComicCache>;
}
