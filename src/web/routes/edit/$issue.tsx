import { createFileRoute } from '@tanstack/react-router';
import t from '@/shared/config';
import { Tag } from '@/web/components';
import { Icon, Tooltip } from '@/web/components/atoms';

export const Route = createFileRoute('/edit/$issue')({
  component: RouteComponent,
});

function RouteComponent() {
  const { issue: issueId } = Route.useParams();

  const { data: issue } = t.issue.getIssue.useQuery({
    issueId,
  });

  return (
    <div className='flex w-full h-full'>
      <div className='h-full w-4/6 flex flex-col items-start py-3 px-2 justify-start'>
        <div className='flex items-center justify-between w-full'>
          <span className='text-lg font-bold uppercase font-code tracking-wide'>
            {issue?.issue.issueTitle.replace(/\s*\([^)]*\)/, '')}
          </span>
          <div className='w-3/6 flex items-center justify-end'>
            <Tooltip content='Refresh Information'>
              <button className='p-2 border border-solid border-neutral-900 hover:bg-neutral-900/20'>
                <Icon name='ArrowCounterClockwise' size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className='flex flex-col gap-2 my-3'>
          <span className='text-sm text-neutral-400 p-2 font-medium font-alternate bg-neutral-950 space-y-2'>
            {issue?.metadata?.Summary}
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium
            odit itaque minus quia at optio nam ducimus praesentium, excepturi
            natus recusandae sunt eaque molestiae molestias eius dolorem ipsum
            atque deserunt.
          </span>
          <div className='flex items-center justify-start gap-3'>
            {issue?.metadata?.Summary?.includes('NSFW') && <Tag type='nsfw' />}
          </div>
        </div>
      </div>
      <div className='h-full w-2/6 flex flex-col items-start justify-start p-3 border-l border-l-solid border-l-neutral-900'>
        <img
          src={issue?.issue.thumbnailUrl}
          alt={issue?.issue.issueTitle}
          className='w-full h-full'
        />
      </div>
    </div>
  );
}
