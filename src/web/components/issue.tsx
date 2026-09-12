import { Menu } from '@base-ui/react/menu';
import { useRouter } from '@tanstack/react-router';
import t from '@/shared/config';
import { Icon } from './atoms';

export default function IssueBox(issue: Partial<Issue>) {
  const nav = useRouter();
  const utils = t.useUtils();

  const { mutate: deleteIssue } = t.issue.deleteIssue.useMutation({
    onSuccess: () => utils.library.getLibrary.invalidate(),
  });

  return (
    <div className='w-2/6 flex cursor-pointer gap-5 border border-solid border-l-transparent border-t-transparent border-neutral-900 p-3'>
      <img
        src={issue.thumbnailUrl}
        className='w-40 h-50 border border-solid border-neutral-800'
        alt={`thumb_${issue.id}`}
      />
      <div className='flex flex-col items-start justify-between gap-2'>
        <span className='text-xs uppercase w-full font-bold text-neutral-300'>
          {issue.issueTitle}
        </span>
        <div className='w-full flex items-center justify-between gap-2'>
          <span className='text-neutral-500 text-xs uppercase'>
            {issue.dateCreated?.toString()}
          </span>
          <div className='flex items-center justify-end gap-2'>
            <button
              onClick={() =>
                nav.navigate({
                  to: '/read/$issueId',
                  params: {
                    // @ts-expect-error
                    issueId: issue.id,
                  },
                })
              }
              className='p-1.5 border border-solid border-neutral-900 bg-neutral-900/10'
            >
              <Icon name='Eyeglasses' size={15} />
            </button>
            <Menu.Root>
              <Menu.Trigger className='p-1.5 border border-solid border-neutral-900 bg-neutral-900/10'>
                <Icon name='DotsThreeVertical' size={15} />
              </Menu.Trigger>
              <Menu.Portal>
                {' '}
                <Menu.Positioner
                  className='outline-hidden'
                  sideOffset={8}
                  align='start'
                >
                  <Menu.Popup className='relative origin-(--transform-origin) border border-neutral-900 bg-neutral-950 py-1 text-neutral-3000 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0'>
                    <Menu.Item className='menuItem'>
                      Add To Collection
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        nav.navigate({
                          to: '/edit/$issue',
                          params: {
                            // @ts-expect-error
                            issue: issue.id,
                          },
                        })
                      }
                      className='menuItem'
                    >
                      Edit Issue
                    </Menu.Item>
                    <Menu.Separator className='mx-1 my-1 h-px bg-neutral-900' />{' '}
                    <Menu.Item
                      // @ts-expect-error
                      onClick={() => deleteIssue({ issueId: issue.id })}
                      className='menuItem'
                    >
                      Delete Issue
                    </Menu.Item>{' '}
                  </Menu.Popup>{' '}
                </Menu.Positioner>{' '}
              </Menu.Portal>
            </Menu.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
