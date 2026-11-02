import { Icon } from '@atoms';
import { Popover } from '@base-ui/react/popover';
import { Tabs } from '@base-ui/react/tabs';
import { Spinner } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import React, { memo, Suspense, useCallback, useState } from 'react';
import t from '@/shared/config';
import { useTimeout } from '../hooks';

const Issue = React.lazy(() => import('../components/issue'));
const Collection = React.lazy(() => import('../components/collection'));

export const Route = createFileRoute('/')({
  component: memo(Component),
});

function Component() {
  const [, setEnabled] = useState(false);

  const { data, isLoading } = t.library.getLibrary.useQuery();

  useTimeout(() => setEnabled(true), 500);

  console.log({ data });

  if (isLoading || !data) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue='issues' className='w-full h-full'>
      <Tabs.List className='absolute z-10 flex overflow-hidden bottom-3 left-[44%] text-xs bg-ground shadow-lg border border-solid border-line rounded-lg'>
        <Tabs.Tab className='px-6 py-2 border-r border-r-line' value='issues'>
          Issues
        </Tabs.Tab>
        <Tabs.Tab className='px-4 py-2' value='collections'>
          Collections
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel className='w-full h-full' value='issues'>
        <IssuesView issues={data.issues ?? []} />
      </Tabs.Panel>
      <Tabs.Panel className='w-full h-full' value='collections'>
        <CollectionsView collections={data.collections ?? []} />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

const IssuesView = memo(({ issues }: { issues: Partial<Issue>[] }) => {
  const { mutate, isPending } = t.issue.addIssue.useMutation();

  if (issues.length === 0) {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        <button
          onClick={() => mutate()}
          disabled={isPending}
          className='bg-ground border border-solid rounded-2xl shadow text-sm px-5 py-2 disabled:opacity-[0.7]'
        >
          Add Issue
        </button>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex p-3 gap-5'>
      <Suspense fallback={<div>loading...</div>}>
        {issues.map((issue) => (
          // @ts-expect-error: idfk man
          <Issue key={issue.id} issue={issue} />
        ))}
      </Suspense>
    </div>
  );
});

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

const CollectionsView = memo(
  ({ collections }: { collections: Array<CollectionProp> }) => {
    const utils = t.useUtils();
    const { mutate, isPending } = t.library.createCollection.useMutation({
      onSuccess: () => utils.library.invalidate(),
    });
    const [name, setName] = useState<string | null>(null);

    const createCollection = useCallback(() => {
      if (name === null) return;

      mutate({ collectionName: name });
    }, []);

    if (collections.length === 0) {
      return (
        <div className='flex items-center justify-center w-full h-full'>
          <Popover.Root>
            <Popover.Trigger
              disabled={isPending}
              className='bg-ground border border-solid rounded-2xl shadow text-sm px-5 py-2'
            >
              New Collection
            </Popover.Trigger>
            <Popover.Portal className='z-30'>
              <Popover.Positioner
                sideOffset={10}
                side='bottom'
                className='z-20 outline-none'
              >
                <Popover.Arrow className="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:-top-1.5 data-[side=left]:-right-2.25 data-[side=left]:rotate-90 data-[side=right]:-left-2.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-background before:border before:border-border before:transform-[translate(-50%,50%)_rotate(45deg)]" />
                <Popover.Popup className='popup overflow-hidden flex'>
                  <input
                    className='input p-2 bg-ground outline-none placeholder:text-sm text-sm w-full'
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder='Collection Name'
                    // biome-ignore lint/a11y/noAutofocus: will figure out
                    autoFocus
                  />
                  <button onClick={createCollection} className='py-2 px-3'>
                    <Icon name='Check' size={14} />
                  </button>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
      );
    }

    return (
      <div className='w-full h-full flex p-2 gap-5'>
        <Suspense fallback={<div>loading...</div>}>
          {collections.map((collection) => (
            <Collection key={collection.id} {...collection} />
          ))}
        </Suspense>
      </div>
    );
  },
);
