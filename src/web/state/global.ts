import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

const globalState = observable<GlobalState>({
  colorMode: "light",
  firstLaunch: true,
  isFullscreen: false,
  libraryView: "issues",
  appId: null,
  lastOpenedTab: "issues",
  reader: {
    direction: "horizontal",
  },
});

export const fullScreenState$ = observable<{ isFullscreen: boolean }>({
  isFullscreen: false,
});

const readingState = observable<ReadingState>({
  doneReading: new Map<string, DoneReading>(),
  currentlyReading: new Map<string, CurrentlyReading>(),
});

export const globalState$ = persistObservable(globalState, {
  local: "global_state",
});

export const readingState$ = persistObservable(readingState, {
  local: "reading_state",
});
