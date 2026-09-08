import { Tabs } from '@base-ui/react/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { memo } from 'react';

export const Route = createFileRoute('/settings')({
  component: memo(Component),
});

function Component() {
  return (
    <Tabs.Root className='w-full h-full flex flex-col items-center'>
      <Tabs.List className='flex border-b border-solid border-b-neutral-900 w-full flex-col items-start justify-start h-full'>
        <Tabs.Tab
          className='px-5 py-3 uppercase flex items-center justify-center gap-3 text-xs border-r border-r-solid border-r-neutral-900 data-active:bg-accent/5 data-active:text-accent data-active:border-accent/5 data-active:font-medium'
          value='storage'
        >
          storage
        </Tabs.Tab>
      </Tabs.List>
      <div className='h-full w-full'>
        <Tabs.Panel value='storage' className='p-1'>
          storage
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
