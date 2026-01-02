import { Env } from '@/env';
import ComicVine from '@comic-vine/client';

export const comicVineClient = new ComicVine({
  apiKey: Env.COMIC_VINE_API_KEY,
  client: {
    defaultCacheTTL: Number.POSITIVE_INFINITY,
    throwOnRateLimit: false,
  },
});
