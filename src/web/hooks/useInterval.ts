import { useEffect } from 'react';

export default function useInterval(cb: () => void, duration: number) {
  useEffect(() => {
    const interval = setInterval(cb, duration);

    return () => clearInterval(interval);
  }, [cb, duration]);
}
