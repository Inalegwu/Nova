import 'dotenv/config';
import { cleanEnv, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  COMIC_VINE_API_KEY: str(),
});
