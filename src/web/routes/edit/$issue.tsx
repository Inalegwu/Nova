import { Icon, Tooltip } from '@atoms';
import { Editable, Spinner, Tag } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import t from '@/shared/config';

export const Route = createFileRoute('/edit/$issue')({
  component: RouteComponent,
});

function RouteComponent() {
  const utils = t.useUtils();
  const router = useRouter();
  const { issue: issueId } = Route.useParams();

  const { data: issue } = t.issue.getIssue.useQuery({
    issueId,
  });

  const { mutate: editIssueTitle } = t.issue.editIssueTitle.useMutation({
    onSuccess: () => {
      utils.invalidate();
      toast.success('Updated issue title');
    },
  });

  const { mutate: fetchInformation, isPending } =
    t.issue.fetchMetadata.useMutation({
      onSuccess: () => {
        utils.invalidate();
        toast.success('Updated Information Successfully');
      },
    });

  if (!issueId) {
    return router.navigate({
      to: '/',
    });
  }

  return (
    <div className='flex w-full h-full'>
      <div className='h-full w-4/6 flex flex-col items-start py-3 px-4 justify-start'>
        <div className='flex items-center gap-3 justify-between w-full mb-10'>
          <Editable
            className='font-bold text-2xl w-full'
            initialValue={
              issue?.issue.issueTitle.replace(/\s*\([^)]*\)/, '') ?? ''
            }
            onBlur={(value) => {
              console.log(value);
              editIssueTitle({ issueId: issue?.issue.id!, issueTitle: value });
            }}
          />
          <div className='flex items-center justify-end'>
            <Tooltip content='Refresh Information'>
              <button
                onClick={() =>
                  fetchInformation({ issueName: issue?.issue.issueTitle })
                }
                className='p-2 border border-line rounded-xl bg-ground'
              >
                {isPending ? (
                  <Spinner size={14} color='#FFFFFF' />
                ) : (
                  <Icon name='ArrowCounterClockwise' size={14} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <span className='text-sm text-muted p-2.5 font-medium bg-ground rounded-xl border border-line h-full min-h-60 space-y-2'>
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
      <div className='h-full w-2/6 flex flex-col items-start justify-start p-5'>
        <img
          src={issue?.issue.thumbnailUrl}
          alt={issue?.issue.issueTitle}
          className='w-full h-full border border-line rounded-3xl shadow-2xl'
        />
      </div>
    </div>
  );
}
