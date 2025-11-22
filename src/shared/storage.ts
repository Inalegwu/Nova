import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as schema from "./schema";

const db = pipe(new Database(process.env.db_url!), (client) =>
  drizzle(client, { schema }),
);

Effect.try(() => migrate(db, { migrationsFolder: "drizzle/" })).pipe(
  Effect.catchTag("UnknownException", (e) => Effect.logFatal(e)),
  Effect.annotateLogs({
    module: "storage.migrate",
  }),
  Effect.runSync,
);

export default db;
