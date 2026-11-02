import { useRouter } from '@tanstack/react-router';
import moment from 'moment';

type Props = {
  issue: Issue;
};

export default function Issue({ issue }: Props) {
  const r = useRouter();
  return (
    <div
      style={{ width: 250, height: 300 }}
      onClick={() =>
        r.navigate({
          to: '/read/$issueId',
          params: {
            issueId: issue.id,
          },
        })
      }
      className='border h-3/6 border-solid border-line rounded-3xl hover:shadow-md px-3 pb-5 flex flex-col items-start justify-end corner-squircle bg-dim/10 cursor-pointer'
    >
      <span className='font-medium capitalize tracking-wide'>
        {issue.issueTitle}
      </span>
      <span className='text-xs text-dim lowercase'>
        {moment(issue.dateUpdated).fromNow()}
      </span>
    </div>
  );
}
