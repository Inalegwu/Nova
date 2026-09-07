import { exposeElectronTRPC } from 'trpc-electron/main';

process.once('loaded', () => {
  console.log("fuck yeah I'm mounted up");
  exposeElectronTRPC();
});
