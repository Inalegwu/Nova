import { useRouter } from '@tanstack/react-router';
import moment from 'moment';

type Props = {
  issue: Issue;
};

export default function Issue({ issue }: Props) {
  const r = useRouter();

  return (
    <div
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
    </div>
  );
}
