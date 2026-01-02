import type { Context } from '@/shared/context';
import { initTRPC } from '@trpc/server';

const t = initTRPC.context<Context>().create({
  isServer: true,
});

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
// this is for the future, when account creation and syncing come into play
// export const protectedProcedure=t.procedure.use(async(opts)=>{})
