import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      appId: null,
      colorMode: 'light',
      isFullscreen: false,
      lastOpenedTab: 'issues',
      firstLaunch: true,
      toggleColorMode: () =>
        set((state) => ({
          ...state,
          colorMode: state.colorMode === 'dark' ? 'light' : 'dark',
        })),
      setFullScreen: (value) =>
        set((state) => ({ ...state, isFullscreen: value })),
      updateFirstLaunch: () =>
        set((state) => ({ ...state, firstLaunch: !state.firstLaunch })),
      toggleFullScreen: () =>
        set((state) => ({ ...state, isFullscreen: !state.isFullscreen })),
      setAppId: (id) => set((state) => ({ ...state, appId: id })),
      clearAppId: () => set((state) => ({ ...state, appId: null })),
      setLastOpenedTab: (tab) =>
        set((state) => ({ ...state, lastOpenedTab: tab })),
    }),
    {
      name: 'global__state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useReaderState = create<ReaderState>()(
  persist(
    (set) => ({
      direction: 'horizontal',
      setReaderDirection: (dir) =>
        set((state) => ({ ...state, direction: dir })),
      toggleReaderDirection: () =>
        set((state) => ({
          ...state,
          direction:
            state.direction === 'horizontal' ? 'vertical' : 'horizontal',
        })),
    }),
    {
      name: 'reader__state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
