import * as Schema from 'effect/Schema';
import { z } from 'zod';

export const parserSchema = z.object({
  parsePath: z.string(),
  action: z.enum(['LINK', 'UNLINK']),
});

export const deletionWorkerSchema = z.object({
  issueId: z.string(),
});

export const workerResponseSchema = z.object({
  message: z.string(),
  completed: z.boolean(),
  error: z.unknown().nullable(),
});

export const fetchPagesWorkerSchema = z.object({
  issueId: z.string(),
});

export const fetchPagesResponseSchema = z.object({
  pages: z.array(
    z.object({
      id: z.string(),
      data: z.string(),
    }),
  ),
});

export const cacheWorkerSchema = z.object({});

export const MetadataSchema = Schema.Struct({
  Series: Schema.String.pipe(Schema.optional),
  Issue: Schema.Int.pipe(Schema.optional),
  Web: Schema.String.pipe(Schema.optional),
  LanguageISO: Schema.String.pipe(Schema.optional),
  PageCount: Schema.Int.pipe(Schema.optional),
  Notes: Schema.String.pipe(Schema.optional),
  writer: Schema.String.pipe(Schema.optional),
  Month: Schema.Int.pipe(Schema.optional),
  Year: Schema.Int.pipe(Schema.optional),
  Summary: Schema.String.pipe(Schema.optional),
  Date: Schema.Date.pipe(Schema.optional),
});

export const ComicCache = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    issueTitle: Schema.String,
    thumbnail: Schema.String,
    path: Schema.String,
  }),
);

export const dumpSchema = Schema.Struct({
  id: Schema.String,
  error: Schema.String,
  date: Schema.Date,
});

export const dumpFileSchema = Schema.Struct({
  data: Schema.Array(dumpSchema),
});
