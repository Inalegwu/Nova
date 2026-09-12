import { Checkbox, Dialog, ScrollArea } from '@base-ui/react';
import { Collapsible } from '@base-ui/react/collapsible';
import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import t from '@/shared/config';
import { Skeleton } from '../components';
import { Icon } from '../components/atoms';

const Issue = React.lazy(() => import('../components/issue'));

export const Route = createFileRoute('/$collectionId')({
  component: RouteComponent,
});

function RouteComponent() {
  // const utils = t.useUtils();
  const { collectionId } = Route.useParams();

  // const [toAdd, setToAdd] = useState<Array<string>>([]);

  const { data, isLoading: preparing } = t.library.getCollectionById.useQuery(
    { collectionId },
    {},
  );

  // const { data: unmatched } = t.library.getLibrary.useQuery();

  // const { mutate: addToCollection, isPending: adding } =
  //   t.library.addToCollection.useMutation({
  //     onSuccess: () => utils.invalidate(),
  //   });

  if (preparing) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='w-full h-3/6'>
          <Skeleton className='w-1.8/6 h-96 border border-solid border-neutral-200 dark:border-neutral-800' />
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap content-start overflow-y-scroll'>
      {data?.issues?.length === 0 && (
        <div className='w-full h-full items-center justify-center flex flex-col'>
          <h1 className='uppercase text-xl font-bold text-neutral-400'>
            No Issues in your library
          </h1>
          <button className='my-5 flex items-center justify-center gap-2 px-5 py-2 border border-neutral-800 bg-neutral-900 text-xs font-code uppercase'>
            <span>Add Issue</span>
            <Icon name='Plus' size={12} />
          </button>
        </div>
      )}
      {data?.issues?.map((issue) => (
        // @ts-expect-error
        <Issue key={issue.id} {...issue} />
      ))}
      <Collapsible.Root className='flex flex-col justify-center text-neutral-350 absolute z-5 bottom-3 right-3'>
        <Collapsible.Trigger className='group flex text-xs uppercase h-8 items-center justify-between gap-2 rounded-none border border-neutral-900 bg-neutral-950 pl-5 pr-4 leading-none whitespace-nowrap font-normal text-neutral-300 select-none hover:not-data-disabled:bg-neutral-900  active:not-data-disabled:bg-neutral-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-400 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500'>
          <span>viewing: {data?.collection?.collectionName}</span>
          <Icon name='Info' weight='fill' size={12} />
        </Collapsible.Trigger>
        <Collapsible.Panel className="flex h-(--collapsible-panel-height) flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
          <div className='flex flex-col gap-2'>
            {/* @ts-expect-error */}
            <AddIssueToCollection collectionId={data?.collection?.id} />
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

const AddIssueToCollection = ({ collectionId }: { collectionId: string }) => {
  const utils = t.useUtils();
  const [toAdd, setToAdd] = useState<Array<string>>([]);

  const { data: unmatched } = t.library.getLibrary.useQuery();

  const { mutate: addToCollection, isPending: adding } =
    t.library.addToCollection.useMutation({
      onSuccess: () => utils.invalidate(),
    });

  const { data } = t.library.getCollectionById.useQuery({ collectionId }, {});

  return (
    <Dialog.Root>
      <Dialog.Trigger className='flex text-xs uppercase items-center justify-start w-full px-2 py-1.5 border-b border-b-solid border-neutral-950'>
        Add Issue
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className='fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute' />
        <Dialog.Popup className='fixed top-1/2 left-1/2 -mt-8 w-xl max-w-[calc(100vw-1rem)] max-h-90 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-neutral-950 p-6 text-neutral-200 outline outline-neutral-900 transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0'>
          <Dialog.Title className='font-bold uppercase text-lg'>
            Add Issue To Collection
          </Dialog.Title>
          <ScrollArea.Root className='h-50 w-full max-w-[calc(100vw-8rem)] my-3'>
            <ScrollArea.Viewport className='h-full overscroll-contain outline bg-neutral-900 p-1 gap-2 -outline-offset-1 outline-neutral-800 focus-visible:outline focus-visible:outline-blue-800'>
              {unmatched?.issues?.map((issue) => (
                <div
                  key={issue.id}
                  className='flex items-center justify-between py-1 px-2'
                >
                  <p className='text-xs font-medium text-neutral-200'>
                    {issue.issueTitle}
                  </p>
                  <Checkbox.Root
                    onCheckedChange={(checked) =>
                      checked
                        ? // @ts-expect-error
                          setToAdd((old) => [...old, issue.id])
                        : setToAdd((old) => [
                            ...old.filter((v) => v !== issue.id),
                          ])
                    }
                    className='flex size-5 items-center justify-center focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-checked:bg-neutral-900 data-checked:border data-checked:border-neutral-900 data-unchecked:border data-unchecked:border-neutral-800'
                  >
                    <Checkbox.Indicator className='flex text-gray-50 dark:text-neutral-200 data-unchecked:hidden'>
                      <Icon name='Check' size={11} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              ))}
            </ScrollArea.Viewport>
          </ScrollArea.Root>
          <button
            disabled={adding}
            className='flex gap-2 px-5 py-1 bg-black text-white'
            onClick={() =>
              addToCollection({
                // @ts-expect-error
                collectionId: data?.collection?.id,
                issues: toAdd,
              })
            }
          >
            <p className='text-xs uppercase'>
              Add To {data?.collection?.collectionName}
            </p>
            <Icon name='Plus' size={12} />
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
