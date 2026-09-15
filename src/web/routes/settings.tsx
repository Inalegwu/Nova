import { Select } from '@base-ui/react/select';
import { Tabs } from '@base-ui/react/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { memo } from 'react';
import { Icon } from '../components/atoms';

const IssueStyles = [
  {
    name: 'Compact',
    value: 'compact',
  },
  {
    name: 'Expanded',
    value: 'expanded',
  },
  {
    name: 'Extra Large',
    value: 'extra-large',
  },
];

export const Route = createFileRoute('/settings')({
  component: memo(Component),
});

function Component() {
  return (
    <Tabs.Root className='w-full h-full flex flex-col items-center'>
      <Tabs.List className='flex border-b border-solid border-b-neutral-900 w-full items-start justify-start'>
        <Tabs.Tab
          className='px-5 py-3 uppercase flex items-center justify-center gap-3 text-xs border-r border-r-solid border-r-neutral-900 data-active:bg-accent/5 data-active:text-accent data-active:border-accent/5 data-active:font-medium'
          value='storage'
        >
          storage
        </Tabs.Tab>
        <Tabs.Tab
          className='px-5 py-3 uppercase flex items-center justify-center gap-3 text-xs border-r border-r-solid border-r-neutral-900 data-active:bg-accent/5 data-active:text-accent data-active:border-accent/5 data-active:font-medium'
          value='appearance'
        >
          appearance
        </Tabs.Tab>
      </Tabs.List>
      <div className='h-full w-full'>
        <Tabs.Panel value='storage' className='p-1'>
          storage
        </Tabs.Panel>
        <Tabs.Panel value='appearance' className=''>
          <div className='w-full flex items-center justify-between px-5 py-2 border-b border-b-solid border-b-neutral-900'>
            <div className='flex flex-col items-start justify-center'>
              <h1 className='font-bold uppercase text-sm'>Issues</h1>
              <span className='text-sm text-neutral-600'>
                The size of issue elements on the home page
              </span>
            </div>
            <Select.Root>
              <Select.Trigger className='flex items-center justify-between gap-2 px-4 py-2 text-xs leading-none whitespace-nowrap border bg-neutral-900 border-solid border-neutral-900 text-neutral-500 uppercase data-pressed:bg-neutral-100 font-normal'>
                <Select.Value
                  className='data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400'
                  placeholder='Select Style'
                />
                <Select.Icon>
                  <Icon name='CaretDown' size={10} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner
                  className='outline-hidden select-none z-10'
                  sideOffset={4}
                >
                  <Select.Popup className='group min-w-(--anchor-width) origin-(--transform-origin) bg-clip-padding border border-neutral-950 bg-white text-neutral-950 outline-hidden shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none'>
                    <Select.ScrollUpArrow className="top-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute data-[side=none]:before:-top-full before:left-0 before:h-full before:w-full before:content-[''] dark:bg-neutral-950">
                      <Icon name='CaretUp' size={12} />
                    </Select.ScrollUpArrow>
                    <Select.List className='relative py-1 scroll-py-6 overflow-y-auto max-h-(--available-height)'>
                      {IssueStyles.map(({ name, value }) => (
                        <Select.Item
                          key={name}
                          value={value}
                          className='grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950'
                        >
                          <Select.ItemIndicator className='col-start-1'>
                            <Icon name='Check' />{' '}
                          </Select.ItemIndicator>{' '}
                          <Select.ItemText className='col-start-2'></Select.ItemText>{' '}
                        </Select.Item>
                      ))}{' '}
                    </Select.List>{' '}
                    <Select.ScrollDownArrow className="bottom-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:-bottom-full dark:bg-neutral-950">
                      {' '}
                      <Icon name='CaretDown' size={12} />{' '}
                    </Select.ScrollDownArrow>{' '}
                  </Select.Popup>{' '}
                </Select.Positioner>{' '}
              </Select.Portal>{' '}
            </Select.Root>
          </div>
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
