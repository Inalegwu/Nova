import { deeplinkChannel } from '@/shared/channels';
import { createContext } from '@/shared/context';
import { appRouter } from '@/shared/routers/_app';
import { BrowserWindow, app, screen } from 'electron';
import { createIPCHandler } from 'electron-trpc/main';
import os from 'node:os';
import path from 'node:path';

app.setName('Nova');

const data_dir = path.join(app.getPath('appData'), 'Nova');

process.env.db_url = path.join(data_dir, 'nova.db');
process.env.cache_dir = path.join(data_dir, 'Library');
process.env.data_dir = data_dir;
process.env.source_dir = path.join(`${os.homedir()}/Downloads`, 'Comics');
process.env.lib_dir = path.join(data_dir, 'Library');
process.env.error_dump = path.join(data_dir, 'Nova', 'ErrorDump.json');

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('nova', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('nova');
}

const createWindow = () => {
  const instanceLock = app.requestSingleInstanceLock();

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    frame: false,
    show: false,
    width: width - 25,
    height: height - 25,
    minWidth: width - 25,
    minHeight: height - 25,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });

  createIPCHandler({
    router: appRouter,
    windows: [mainWindow],
    createContext,
  });

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
  });

  if (import.meta.env.DEV) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  if (!instanceLock) {
    app.quit();
  } else {
    app.on('second-instance', (_, command, __) => {
      _.preventDefault();
      if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.restore();
        mainWindow.focus();
        const path = command.pop();

        if (!path) return;

        console.log('DEEPLINK PATH RECEIVED');
        console.log({ path });

        deeplinkChannel.postMessage({
          path,
        });
      }
    });
  }

  mainWindow.webContents.openDevTools({ mode: 'bottom' });
};

app.whenReady().then(() => createWindow());

app.once('window-all-closed', () => {
  app.quit();
});
