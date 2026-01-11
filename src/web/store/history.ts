import {
  createCollection,
  localStorageCollectionOptions,
} from '@tanstack/react-db';
import { Schema } from 'effect';

const HistorySchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  thumbnail: Schema.String,
  currentPage: Schema.Number.pipe(Schema.positive()),
  totalPages: Schema.Number.pipe(Schema.positive()),
  lastRead: Schema.String,
  status: Schema.Literal('currently-reading', 'half-way', 'done'),
}).pipe(Schema.standardSchemaV1);

export type History = Schema.Schema.Type<typeof HistorySchema>;

export const historyCollection = createCollection(
  localStorageCollectionOptions({
    id: 'reading-history',
    storageKey: 'app-reading-history',
    getKey: (item) => item.id,
    schema: HistorySchema,
  }),
);

// status:
//      data.currentPage === Math.floor(data.totalPages / 2)
//        ? ('half-way' as const)
//        : data.currentPage === data.totalPages
//          ? ('done' as const)
//          : ('currently-reading' as const),
