import { useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { type Key, useRef } from 'react';

type Props<T> = {
  data: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => Key;
};

export default function Flatlist<T extends Record<string, unknown>>({
  data,
  renderItem,
  keyExtractor,
}: Props<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
    getItemKey: (index) => keyExtractor(data[index]),
  });

  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualizer
          .getVirtualItems()
          .map((row) => renderItem(data[row.index], row.index))}
      </div>
    </div>
  );
}
