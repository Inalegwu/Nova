import { eq, useLiveQuery } from '@tanstack/react-db';
import { createFileRoute } from '@tanstack/react-router';
import * as Array from 'effect/Array';
import React, { Suspense } from 'react';
import { historyCollection } from '../store/history';

export const Route = createFileRoute('/history')({
  component: Index,
});

function Index() {
  const { data: uncompleted } = useLiveQuery((q) =>
    q
      .from({ history: historyCollection })
      .where(({ history }) => !eq(history.status, "done"))
      .orderBy(({ history }) => history.lastRead, 'asc'),
  );

  console.log({ uncompleted });

  return (
    <div className='w-full h-full font-medium'>
      <h1 className='text-2xl font-bold'>under construction</h1>
    </div>
  );
}
