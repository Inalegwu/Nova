import { ContextMenu } from '@base-ui/react';
import { InfoCircle, TrashBinMinimalistic } from '@solar-icons/react';
import { useRouter } from '@tanstack/react-router';
import t from '@/shared/config';

export default function IssueBox(issue: Partial<Issue>) {
  const nav = useRouter();
  const utils = t.useUtils();

  const { mutate: deleteIssue } = t.issue.deleteIssue.useMutation({
    onSuccess: () => utils.library.getLibrary.invalidate(),
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        onClick={() =>
          nav.navigate({
            href: '/read/$issueId',
            params: {
              // @ts-expect-error
              issueId: issue.id,
            },
          })
        }
        className='w-90 mb-16 flex cursor-pointer gap-5 border border-solid border-l-transparent border-t-transparent border-neutral-900 p-3'
      >
        <img
          src={issue.thumbnailUrl}
          className='w-50 h-65 bg-zinc-200/5 dark:opacity-[0.8] border border-solid border-neutral-200 dark:border-neutral-900'
          alt={`thumb_${issue.id}`}
        />
        <div className='flex flex-col items-start justify-start gap-2'>
          <span className='text-xs uppercase w-full font-medium text-neutral-400'>
            {issue.issueTitle}
          </span>
          <span className='text-neutral-500'>
            {issue.dateCreated?.toString()}
          </span>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal className='outline-none'>
        <ContextMenu.Positioner className='origin-(--transform-origin) transition-opacity data-ending-style:opacity-0'>
          <ContextMenu.Popup className='flex flex-col bg-neutral-950 text-neutral-200 items-start justify-center border border-solid border-neutral-900'>
            <div className='flex w-full items-center justify-start flex-wrap'>
              <ContextMenu.Item
                onClick={() =>
                  nav.navigate({
                    to: '/edit/$issue',
                    params: {
                      issue: issue.id || '',
                    },
                  })
                }
                className='ctxMenuRowItem'
              >
                <InfoCircle size={14} />
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() =>
                  deleteIssue({
                    issueId: issue.id!,
                  })
                }
                className='ctxMenuRowItem'
              >
                <TrashBinMinimalistic size={14} />
              </ContextMenu.Item>
            </div>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

// function AddToCollection() {
//   return (
//     <Dialog.Root>
//       <Dialog.Trigger>
//         <AddCircle weight="Outline" size={14} />
//       </Dialog.Trigger>
//       <Dialog.Portal>
//         <Dialog.Backdrop render={<motion.div initial={{ display: "none", opacity: 0 }} animate={{ display: "flex", opacity: 1 }} exit={{ display: "none", opacity: 0 }} />} className="w-full h-screen bg-black/30 flex-items-center justify-center">
//           <Dialog.Popup>popup</Dialog.Popup>
//         </Dialog.Backdrop>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// }
