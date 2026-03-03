import t from '@/shared/config';
import { Tabs } from '@base-ui/react/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTimeout } from '@web/hooks';
import global from '@state';
import React from 'react';

const IssueBox = React.lazy(() => import('../components/issue'));
const CollectionBox = React.lazy(() => import('../components/collection'));

export const Route = createFileRoute('/')({
  component: memo(Component),
});

function Component() {
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
  const setLastOpenedTab = global.app.use.setLastOpenedTab();

  useEffect(() => setLastOpenedTab('issues'), []);

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

// TODO: Move collection creation here
function Collections({ collections }: { collections: Array<CollectionProp> }) {
  const setLastOpenedTab = global.app.use.setLastOpenedTab();

  useEffect(() => setLastOpenedTab('collections'), []);

  return (
    <div className='w-full h-full flex items-start justify-start flex-wrap space-x-4'>
      {collections.map((collection) => (
        <CollectionBox key={collection.id} {...collection} />
      ))}
    </div>
  );
}
