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
          <Skeleton className='w-1.8/6 h-96 border border-solid border-border' />
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap content-start overflow-y-scroll p-3 gap-5'>
      {data?.issues?.length === 0 && (
        <div className='w-full h-full items-center justify-center flex flex-col'>
          <h1 className='uppercase text-xl font-bold text-neutral-400'>
            No Issues in your library
          </h1>
          <AddIssueToCollection collectionId={collectionId} />
        </div>
      )}
      {data?.issues?.map((issue) => (
        <Issue key={issue.id} issue={issue} />
      ))}
      <Collapsible.Root className='flex flex-col justify-center text-neutral-350 absolute z-5 bottom-3 right-3'>
        <Collapsible.Trigger className='group flex uppercase text-xs w-full gap-5 active:scale-[1] h-8 items-center justify-between border border-line border-b-0 bg-ground rounded-xl transition data-panel-open:rounded-b-none shadow px-3 leading-none whitespace-nowrap font-normal text-neutral-300 select-none hover:not-data-disabled:bg-surface/20 active:not-data-disabled:bg-surface/30 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-400 data-disabled:border-border/30 data-disabled:text-neutral-500 disabled:border-border/20 disabled:text-neutral-500'>
          <span>Viewing: {data?.collection?.collectionName}</span>
          <Icon name='Info' weight='fill' size={12} />
        </Collapsible.Trigger>
        <Collapsible.Panel className="flex h-(--collapsible-panel-height) bg-ground border border-line rounded-b-xl flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
          <div className='flex flex-col gap-2'>
            <AddIssueToCollection
              //  @ts-expect-error
              collectionId={data?.collection?.id}
              variant='collapsible'
            />
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

const AddIssueToCollection = ({
  collectionId,
  variant = 'standalone',
}: {
  collectionId: string;
  variant?: 'standalone' | 'collapsible';
}) => {
  const utils = t.useUtils();
  const [toAdd, setToAdd] = useState<Array<string>>([]);

  const { data: unmatched } = t.library.getLibrary.useQuery();

  const { mutate: addToCollection, isPending: adding } =
    t.library.addToCollection.useMutation({
      onSuccess: () => utils.invalidate(),
    });

  const { data } = t.library.getCollectionById.useQuery({ collectionId }, {});

  const classNames = {
    standalone:
      'flex text-xs uppercase items-center justify-center my-4 active:scale-[1] px-5 py-2 bg-ground font-medium border border-line rounded-xl shadow',
    collapsible:
      'py-2 text-sm flex items-center justify-between px-3 active:scale-[1]',
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger className={classNames[variant]}>
        <span>Add Issue</span>
        <Icon name='Plus' size={12} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className='fixed z-20 inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute' />
        <Dialog.Popup className='fixed top-1/2 z-50 left-1/2 -mt-8 w-xl max-w-[calc(100vw-1rem)] max-h-90 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-ground rounded-2xl border border-line p-6 transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0'>
          <Dialog.Title className='font-bold uppercase text-lg'>
            Add Issue To Collection
          </Dialog.Title>
          <ScrollArea.Root className='h-50 w-full max-w-[calc(100vw-8rem)] my-3'>
            <ScrollArea.Viewport className='h-full overscroll-contain'>
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
                    className='flex size-5 items-center rounded-md justify-center focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent/20 data-checked:bg-panel data-checked:border data-checked:border-line shadow data-checked:shadow-none transition data-unchecked:border data-unchecked:border-line'
                  >
                    <Checkbox.Indicator className='flex text-text-muted data-unchecked:hidden'>
                      <Icon name='Check' size={11} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              ))}
            </ScrollArea.Viewport>
          </ScrollArea.Root>
          <button
            disabled={adding}
            className='flex gap-2 px-5 py-1 bg-panel rounded-lg border border-line text-white'
            onClick={() =>
              addToCollection({
                // @ts-expect-error
                collectionId: data?.collection?.id,
                issues: toAdd,
              })
            }
          >
            <p className='text-xs'>Add To {data?.collection?.collectionName}</p>
            <Icon name='Plus' size={12} />
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
