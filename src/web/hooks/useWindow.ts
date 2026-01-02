import { useEffect } from 'react';

export const useWindow = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, event: WindowEventMap[K]) => void,
) => {
  useEffect(() => {
    window.addEventListener(type, listener);

    return () => window.removeEventListener(type, listener);
  }, [type, listener]);
};
