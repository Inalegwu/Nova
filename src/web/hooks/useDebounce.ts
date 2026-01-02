import { debounce } from '@/shared/utils';
import { useEffect, useMemo } from 'react';

export const useDebounce = <A = unknown[], R = void>(
  fn: (args: A) => R,
  ms: number,
): ((args: A) => Promise<R>) => {
  const [debounceFn, tearDown] = useMemo(
    () => debounce<A, R>(fn, ms),
    [fn, ms],
  );

  useEffect(() => () => tearDown(), [tearDown]);

  return debounceFn;
};
