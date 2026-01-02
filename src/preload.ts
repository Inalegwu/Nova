import { exposeElectronTRPC } from 'electron-trpc/main';

process.once('loaded', () => {
  console.log("fuck yeah I'm mounted up");
  exposeElectronTRPC();
});
