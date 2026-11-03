import { ContextMenu } from '@base-ui/react';
import { useRouter } from '@tanstack/react-router';
import moment from 'moment';
import t from '@/shared/config';
import { Icon } from './atoms';
import Spinner from './spinner';

type Props = {
  issue: Issue;
};

export default function Issue({ issue }: Props) {
  const r = useRouter();
  const utils = t.useUtils();

  const { mutate: deleteIssue, isPending } = t.issue.deleteIssue.useMutation({
    onSuccess: () => utils.library.invalidate(),
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        style={{ width: 257, height: 370 }}
        onClick={() =>
          r.navigate({
            to: '/read/$issueId',
            params: {
              issueId: issue.id,
            },
          })
        }
        className='border relative h-3/6 border-solid border-line overflow-hidden rounded-4xl transition hover:shadow-2xl active:scale-[0.97] flex flex-col items-start justify-end corner-squircle bg-dim/10 cursor-pointer'
      >
        <img
          src={issue.thumbnailUrl}
          className='absolute z-0 w-full h-full'
          alt={issue.issueTitle}
        />
        <div className='absolute gap-1 z-1 px-3 pb-5 w-full h-full bg-ink/40 dark:invert flex flex-col items-start justify-end'>
          <span className='font-medium text-sm capitalize tracking-wide invert'>
            {issue.issueTitle}
          </span>
          <span className='text-xs text-dim lowercase'>
            {moment(issue.dateCreated).fromNow()}
          </span>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner sideOffset={4} className='z-50'>
          <ContextMenu.Popup className='bg-ground overflow-hidden shadow-md rounded-lg flex items-center justify-center flex-wrap border border-solid border-line text-xs'>
            <ContextMenu.Item
              onClick={() => deleteIssue({ issueId: issue.id })}
              disabled={isPending}
              className='flex items-center disabled:opacity-[0.7] justify-center p-2.5 border-r border-r-line cursor-pointer active:scale-[0.97]'
            >
              {isPending ? (
                <Spinner size={14} />
              ) : (
                <Icon name='Trash' size={14} weight='fill' />
              )}
            </ContextMenu.Item>
            <ContextMenu.Item className='flex items-center justify-center p-2.5 cursor-pointer active:scale-[0.97]'>
              <Icon name='Trash' size={14} weight='fill' />
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
