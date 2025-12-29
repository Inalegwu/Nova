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

export const globalState$ = persistObservable(globalState, {
  local: "global_state",
});
