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

const IssueBox = React.lazy(() => import('../components/issue'));
const CollectionBox = React.lazy(() => import('../components/collection'));

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
      <Tabs.Panel value='collections'>
        <Collections collections={data?.collections || []} />
      </Tabs.Panel>
      <Tabs.Panel value='issues'>
        <Issues issues={data?.issues || []} />
      </Tabs.Panel>
    </div>
  );
}

function Issues({ issues }: { issues: Array<Partial<Issue>> }) {
  const setLastOpenedTab = global.app.use.setLastOpenedTab();

  useEffect(() => setLastOpenedTab('issues'), []);

  if (issues.length === 0) {
    return (
      <div className='w-full h-screen flex items-center justify-center flex-wrap space-x-4 overflow-y-scroll'>
        <h1 className='text-3xl font-extrabold'>No Issues Saved</h1>
      </div>
    );
  }

  return (
    <div className='w-full p-2 h-full flex items-start justify-start flex-wrap space-x-4 overflow-y-scroll'>
      {issues.map((issue) => (
        <IssueBox key={issue.id} {...issue} />
      ))}
    </div>
  );
}

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

// TODO: Move collection creation here
function Collections({ collections }: { collections: Array<CollectionProp> }) {
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
    <div className='w-full h-[97vh] flex items-start justify-start flex-wrap space-x-4 relative p-3'>
      {collections.map((collection) => (
        <CollectionBox key={collection.id} {...collection} />
      ))}
      <Dialog.Root>
        <Dialog.Trigger className='absolute font-bold z-1 bottom-2 right-1 bg-neutral-950 px-5 py-2 text-[13.5px] rounded-xl text-white'>
          Create Collection
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className='fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute' />
          <Dialog.Popup className='fixed top-1/2 left-1/2 -mt-8 flex flex-col w-2/6 h-2/6 overflow-hidden md:lg:xl:max-w-[calc(100vw-3rem)] md:lg:xl:max-h-[calc(90vh-3rem)] -translate-x-1/2 rounded-3xl -translate-y-1/2 bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-800 shadow shadow-black/20 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0'>
            <Dialog.Close className='absolute z-1 top-3 right-3'>
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
                  className='px-5 text-sm py-1 rounded-lg bg-black gap-2'
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
