import { Env } from "@/env";
import ComicVine from "@comic-vine/client";
import { createClient } from "@libsql/client";

const database = createClient({
  url: "file:metadata.db",
});

export const comicVineClient = new ComicVine({
  apiKey: Env.COMIC_VINE_API_KEY,
  client: {
    defaultCacheTTL: Number.POSITIVE_INFINITY,
    throwOnRateLimit: false,
  },
});
