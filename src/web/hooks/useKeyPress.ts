import { useEffect } from 'react';

export default function useKeyPress(listener: (e: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener('keypress', listener);

    return () => window.removeEventListener('keypress', listener);
  }, [listener]);
}
