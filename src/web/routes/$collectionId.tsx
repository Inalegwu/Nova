import { Checkbox } from '@base-ui/react/checkbox';
import { Dialog } from '@base-ui/react/dialog';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { CheckCircle, Hearts, List, Widget } from '@solar-icons/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import t from '@/shared/config';
import { Skeleton } from '../components';
import { Icon } from '../components/atoms';

export const Route = createFileRoute('/$collectionId')({
  component: RouteComponent,
});

function RouteComponent() {
  const utils = t.useUtils();
  const { collectionId } = Route.useParams();

  const [toAdd, setToAdd] = useState<Array<string>>([]);
  const [listView] = useState<'list' | 'grid'>('list');

  const { data, isLoading: preparing } = t.library.getCollectionById.useQuery(
    { collectionId },
    {},
  );

  const { data: unmatched } = t.library.getLibrary.useQuery();

  const { mutate: addToCollection, isPending: adding } =
    t.library.addToCollection.useMutation({
      onSuccess: () => utils.invalidate(),
    });

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
    <div className='w-full h-full flex flex-col items-start justify-start'>
      {/* TODO: fill in collection metadata from comic vine */}
      <div className='flex items-center justify-start gap-5 w-full my-3 px-2'>
        <div className='relative w-[26%] h-108 border border-solid overflow-hidden border-neutral-200 dark:border-neutral-800'>
          <div className='absolute z-1 w-full transition h-full bg-black/40 flex flex-col items-start justify-end'>
            <motion.div
              className='bg-neutral-200/20 flex items-center justify-center gap-4 w-full bottom-0 left-0 p-2'
              initial={{ translateY: '50px' }}
              animate={{ translateY: '0px' }}
              transition={{
                bounceDamping: 1,
              }}
            >
              <ToggleGroup className='flex gap-4'>
                <Toggle pressed={listView === 'grid'} render={<button />}>
                  <Widget size={17} />
                </Toggle>
                <Toggle pressed={listView === 'list'} render={<button />}>
                  <List size={17} />
                </Toggle>
              </ToggleGroup>
            </motion.div>
          </div>
          <img
            src={data?.issues?.at(0)?.thumbnailUrl}
            alt={`cover__${data?.collection?.id}`}
            className='w-full h-full absolute z-0'
          />
        </div>
        <div className='flex flex-col items-start justify-start gap-2 w-full h-full'>
          <div className='flex items-center justify-start gap-5'>
            <p className='text-lg font-bold'>
              {data?.collection?.collectionName}
            </p>
            <Dialog.Root>
              <Dialog.Trigger className='my-2 text-neutral-500 p-1.5 border border-solid border-neutral-900'>
                <Icon name='Plus' size={13} />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className='fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute' />
                <Dialog.Popup className='fixed top-1/2 left-1/2 -mt-8 w-xl max-w-[calc(100vw-1rem)] max-h-90 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-neutral-50 dark:bg-neutral-950 p-6 text-neutral-900 dark:text-neutral-200 outline outline-gray-200 transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:outline-gray-300'>
                  <Dialog.Title className='font-bold text-lg'>
                    Add Issue To Collection
                  </Dialog.Title>
                  <ScrollArea.Root className='h-50 w-full max-w-[calc(100vw-8rem)] my-3'>
                    <ScrollArea.Viewport className='h-full overscroll-contain outline bg-neutral-100 dark:bg-neutral-900 p-1 gap-2 -outline-offset-1 outline-gray-200 focus-visible:outline focus-visible:outline-blue-800'>
                      {unmatched?.issues?.map((issue) => (
                        <div
                          key={issue.id}
                          className='flex items-center justify-between py-1 px-2'
                        >
                          <p className='text-xs font-bold text-neutral-800 dark:text-neutral-200'>
                            {issue.issueTitle}
                          </p>
                          <Checkbox.Root
                            onCheckedChange={(checked) =>
                              checked
                                ? setToAdd((old) => [...old, issue.id])
                                : setToAdd((old) => [
                                    ...old.filter((v) => v !== issue.id),
                                  ])
                            }
                            className='flex size-5 items-center justify-center focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-checked:bg-neutral-900 data-unchecked:border data-unchecked:border-neutral-200 data-unchecked:dark:border-neutral-800'
                          >
                            <Checkbox.Indicator className='flex text-gray-50 dark:text-neutral-200 data-unchecked:hidden'>
                              <CheckCircle className='size-3' />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                        </div>
                      ))}
                    </ScrollArea.Viewport>
                  </ScrollArea.Root>
                  <button
                    disabled={adding}
                    className='flex gap-2 bg-neutral-200 text-neutral-800 px-5 py-1 dark:bg-black dark:text-white'
                    onClick={() =>
                      addToCollection({
                        // @ts-expect-error
                        collectionId: data?.collection?.id,
                        issues: toAdd,
                      })
                    }
                  >
                    <p className='text-sm'>
                      Add To {data?.collection?.collectionName}
                    </p>
                    <Icon name='Plus' size={12} />
                  </button>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start w-full'>
        {data?.issues?.map((issue, idx) => (
          <div key={issue.id} className='w-full items-center justify-between'>
            <div
              className={`flex px-3 items-center font-code uppercase text-sm border-b border-b-solid border-b-neutral-900 ${idx === 0 && 'border-t border-t-solid border-t-neutral-900'} hover:bg-neutral-100/40 dark:hover:bg-neutral-950/20 w-full justify-between gap-3 text-sm text-neutral-950 dark:text-neutral-200`}
            >
              <Link
                to='/read/$issueId'
                params={{ issueId: issue.id }}
                className='flex items-center justify-start gap-2 hover:underline transition font-medium'
              >
                <p>{idx + 1}.</p> {'   '}
                <p>{issue.issueTitle}</p>
              </Link>
              <div className='flex items-center justify-end gap-2'>
                <button className='p-2.5 hover:bg-neutral-900/60 border-x border-x-solid border-x-neutral-900'>
                  <Hearts weight='Linear' size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
