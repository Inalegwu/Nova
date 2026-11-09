import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/history')({
  component: Index,
});

function Index() {
  // const { data: uncompleted } = useLiveQuery((q) =>
  //   q
  //     .from({ history: historyCollection })
  //     .where(({ history }) => !eq(history.status, 'done'))
  //     .orderBy(({ history }) => history.lastRead, 'asc'),
  // );

  return (
    <div className='w-full h-full font-medium'>
      <h1 className='text-2xl font-bold'>under construction</h1>
    </div>
  );
}
