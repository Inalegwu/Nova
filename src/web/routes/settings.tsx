import { createFileRoute } from '@tanstack/react-router';
import React, { memo } from 'react';
import { Tabs } from '@base-ui/react/tabs';
import { FlashDrive } from '@solar-icons/react';

export const Route = createFileRoute('/settings')({
  component: memo(Component),
});

function Component() {
  return (
    <Tabs.Root className='w-full h-full flex items-center'>
      <Tabs.List className='flex flex-col items-start rounded-l-md space-y-2 p-2 corner-superellipse/1.3 justify-start h-full w-1/6 bg-neutral-100'>
        <Tabs.Tab
          className='flex items-center justify-start gap-1 text-sm'
          value='Storage'
        >
          <FlashDrive size={14} />
          <span>Storage</span>
        </Tabs.Tab>
      </Tabs.List>
      <div className='h-full w-5/6'>
        <Tabs.Panel value='storage'>storage</Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
