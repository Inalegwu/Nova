import { useEffect } from 'react';

export default function useTimeout(cb: () => void, ms: number) {
  useEffect(() => {
    const t = setTimeout(cb, ms);

    return () => clearTimeout(t);
  }, [cb, ms]);
}
