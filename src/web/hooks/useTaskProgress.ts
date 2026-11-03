import { useState } from 'react';
import type { TaskProgress } from '@/shared/channels/progress-channel';
import t from '@/shared/config';

export const useTaskProgress = () => {
  const [tasks] = useState<Array<TaskProgress>>([]);

  t.taskProgress.useSubscription(undefined, {
    onData: (data) => {
      console.log({ data });
      //   setTasks((prev) => [...prev, data]);
    },
  });

  return tasks;
};
