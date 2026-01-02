import { publicProcedure, router } from '@/trpc';
import { globalState$ } from '@/web/state';
import * as fs from 'node:fs';
import path from 'node:path';

export const windowRouter = router({
  closeWindow: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.window) return;

    const config = globalState$.get();

    fs.writeFileSync(
      path.join(process.env.data_dir!, 'config.json'),
      JSON.stringify(config),
      {
        encoding: 'utf-8',
      },
    );

    ctx.window.close();
  }),
  minimize: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.window) return;
    ctx.window.minimize();
  }),
  maximize: publicProcedure.mutation(({ ctx }) => {
    if (!ctx.window) return;
    const isMaximized = ctx.window.isMaximized();

    if (isMaximized) {
      ctx.window.unmaximize();
    } else {
      ctx.window.maximize();
    }
  }),
});
