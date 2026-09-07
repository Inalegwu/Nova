import { app, BrowserWindow } from 'electron';
import db from './storage';

export async function createContext() {
  const browserWindow = BrowserWindow.getFocusedWindow();

  return {
    window: browserWindow,
    db,
    app,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
