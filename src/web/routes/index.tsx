import { Dialog } from '@base-ui/react/dialog';
import { Tabs } from '@base-ui/react/tabs';
import { CloseCircle } from '@solar-icons/react';
import global from '@state';
import { createFileRoute } from '@tanstack/react-router';
import { useTimeout } from '@web/hooks';
import React, { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import t from '@/shared/config';
import { Spinner } from '../components';
import { Icon } from '../components/atoms';

const Issue = React.lazy(() => import('../components/issue'));
const Collection = React.lazy(() => import('../components/collection'));

export const Route = createFileRoute('/')({
  component: memo(Component),
});

function Component() {
  const [isEnabled, setIsEnabled] = useState(false);

  const { data } = t.library.getLibrary.useQuery(undefined, {
    enabled: isEnabled,
  });

  useTimeout(() => setIsEnabled(true), 500);

  return (
    <div className='w-full h-full'>
      <Tabs.Panel value='collections' className='w-full h-full'>
        {/* @ts-expect-error */}
        <CollectionsView collections={data?.collections || []} />
      </Tabs.Panel>
      <Tabs.Panel value='issues' className='w-full h-full'>
        {/* @ts-expect-error */}
        <IssuesView issues={data?.issues || []} />
      </Tabs.Panel>
    </div>
  );
}

function IssuesView({ issues }: { issues: Array<Partial<Issue>> }) {
  const { mutate: addIssue } = t.issue.addIssue.useMutation();

  const setLastOpenedTab = global.app.use.setLastOpenedTab();

  useEffect(() => setLastOpenedTab('issues'), []);

  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap content-start overflow-y-scroll'>
      {issues.length === 0 && (
        <div className='w-full h-full items-center justify-center flex flex-col'>
          <h1 className='uppercase text-xl font-bold text-neutral-400'>
            No Issues in your library
          </h1>
          <button
            onClick={() => addIssue()}
            className='my-5 flex items-center justify-center gap-2 px-5 py-2 border border-neutral-800 bg-neutral-900 text-xs font-code uppercase'
          >
            <span>Add Issue</span>
            <Icon name='Plus' size={12} />
          </button>
        </div>
      )}
      {issues.map((issue) => (
        <Issue key={issue.id} {...issue} />
      ))}
    </div>
  );
}

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

function CollectionsView({
  collections,
}: {
  collections: Array<CollectionProp>;
}) {
  const utils = t.useUtils();
  const [collectionName, setCollectionName] = useState('');
  const setLastOpenedTab = global.app.use.setLastOpenedTab();

  const { mutate, isPending } = t.library.createCollection.useMutation({
    onSuccess: () => {
      toast.success(`Collection created successfully`);
      utils.library.getLibrary.invalidate();
    },
  });

  useEffect(() => setLastOpenedTab('collections'), []);

  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap relative'>
      {collections.map((collection) => (
        <Collection key={collection.id} {...collection} />
      ))}
      <Dialog.Root>
        <Dialog.Trigger className='fixed font-bold z-1 bottom-2 right-3 border border-solid uppercase border-neutral-900 bg-neutral-950 px-5 py-2 text-xs text-neutral-400'>
          Create Collection
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className='fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute' />
          <Dialog.Popup className='fixed top-1/2 left-1/2 -mt-8 flex flex-col w-2/6 py-7 overflow-hidden md:lg:xl:max-w-[calc(100vw-3rem)] md:lg:xl:max-h-[calc(90vh-3rem)] -translate-x-1/2 -translate-y-1/2 bg-neutral-950 text-neutral-100 border border-neutral-900 shadow shadow-black/20 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0'>
            <Dialog.Close className='absolute z-1 top-3 right-3 text-red-800'>
              <CloseCircle size={20} weight='Bold' />
            </Dialog.Close>
            <div className='w-full h-full px-6 flex flex-col items-start justify-center gap-3'>
              <h1 className='text-2xl font-extrabold'>Collection Name</h1>
              <div className='flex flex-col items-start gap-3 w-full'>
                <input
                  onChange={(e) => setCollectionName(e.currentTarget.value)}
                  className='input'
                  placeholder='name'
                />
                <button
                  className='px-5 text-xs uppercase py-1 bg-black gap-2'
                  onClick={() => mutate({ collectionName })}
                >
                  <span>Create</span>
                  {isPending && <Spinner size={10} color='#FFFFFF' />}
                </button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
