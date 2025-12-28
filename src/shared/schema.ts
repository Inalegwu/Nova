import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const collections = sqliteTable(
  "collections",
  {
    id: text("id").notNull().primaryKey().unique(),
    collectionName: text("collection_name").notNull().unique(),
    dateCreated: integer("date_created", {
      mode: "timestamp",
    }).default(new Date()),
    dateUpdated: integer("date_udpdated", {
      mode: "timestamp",
    }).default(new Date()),
  },
  (table) => ({
    idIndex: index("collection_id_index").on(table.id),
  }),
);

export const issues = sqliteTable(
  "issues",
  {
    id: text("id").notNull().primaryKey().unique(),
    issueTitle: text("issue_title").notNull().unique(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    collectionId: text("collection_id").references(() => collections.id),
    historyId: text("history_id"),
    path: text("path").notNull(),
    dateCreated: integer("date_created", {
      mode: "timestamp",
    }).default(new Date()),
    dateUpdated: integer("date_udpdated", {
      mode: "timestamp",
    }).default(new Date()),
  },
  (table) => ({
    idIndex: index("issue_id_index").on(table.id),
  }),
);

export const metadata = sqliteTable("metadata", {
  id: text("id").notNull().primaryKey(),
  issueId: text("issueId").references(() => issues.id, {
    onDelete: "cascade",
  }),
  Series: text("series"),
  Issue: integer("issue"),
  Web: text("web"),
  LanguageISO: text("language"),
  PageCount: integer("page_count"),
  Notes: text("notes"),
  writer: text("writer"),
  Month: integer("month"),
  Year: integer("year"),
  Summary: text("summary"),
});

export const collectionToIssue = relations(collections, ({ many }) => ({
  issues: many(issues),
}));

export const metaToIssue = relations(metadata, ({ one }) => ({
  issue: one(issues, {
    fields: [metadata.issueId],
    references: [issues.id],
  }),
}));

export const issueToMeta = relations(issues, ({ one }) => ({
  metadata: one(metadata),
}));

export const issueToCollection = relations(issues, ({ one }) => ({
  collection: one(collections, {
    fields: [issues.collectionId],
    references: [collections.id],
  }),
}));
