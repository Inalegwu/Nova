import t from '@/shared/config';
import { Tabs } from '@base-ui/react/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { CollectionBox, IssueBox } from '../components';
import { useTimeout } from '../hooks';
import global from '../state';

export const Route = createFileRoute('/')({
  component: memo(Component),
});

function Component() {
  const utils = t.useUtils();
  const [isEnabled, setIsEnabled] = useState(false);

  const { data } = t.library.getLibrary.useQuery(undefined, {
    enabled: isEnabled,
    onError: (error) => toast.error(error.message),
  });

  useTimeout(() => setIsEnabled(true), 500);

  return (
    <div className='w-full h-full p-1 overflow-y-scroll'>
      <Tabs.Panel value='collections'>
        <Collections collections={data?.collections || []} />
      </Tabs.Panel>
      <Tabs.Panel value='issues'>
        <Issues issues={data?.issues || []} />
      </Tabs.Panel>
    </div>
  );
}

function Issues({ issues }: { issues: Array<Partial<Issue>> }) {
  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap space-x-4 overflow-y-scroll'>
      {issues.map((issue) => (
        <IssueBox key={issue.id} {...issue} />
      ))}
    </div>
  );
}

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

function Collections({ collections }: { collections: Array<CollectionProp> }) {
  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap space-x-4'>
      {collections.map((collection) => (
        <CollectionBox key={collection.id} {...collection} />
      ))}
    </div>
  );
}
