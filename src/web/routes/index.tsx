import { Tabs } from '@base-ui/react';
import { Spinner } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import React, { memo, Suspense, useState } from 'react';
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
      <Tabs.List className='absolute z-10 flex overflow-hidden bottom-3 left-[44.5%] text-xs bg-panel shadow-lg border border-solid border-line rounded-lg'>
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
  if (issues.length === 0) {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        <button className='bg-ground border border-solid rounded-2xl shadow text-sm px-5 py-2'>
          Add Issue
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>loading...</div>}>
      {issues.map((issue) => (
        // @ts-expect-error: idfk man
        <Issue key={issue.id} issue={issue} />
      ))}
    </Suspense>
  );
});

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

const CollectionsView = memo(
  ({ collections }: { collections: Array<CollectionProp> }) => {
    return (
      <Suspense fallback={<div>loading...</div>}>
        {collections.map((collection) => (
          <Collection key={collection.id} {...collection} />
        ))}
      </Suspense>
    );
  },
);
