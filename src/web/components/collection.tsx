import { useRouter } from '@tanstack/react-router';

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

export default function CollectionBox(collection: CollectionProp) {
  const nav = useRouter();

  return (
    <div
      onClick={() =>
        nav.navigate({
          href: '/$collectionId',
          params: {
            // @ts-ignore: this definitely exists
            collectionId: collection.id,
          },
        })
      }
      className='w-50 h-75 mb-16 cursor-pointer relative'
    >
      {collection.issues.length === 0 && (
        <div className='w-full h-full bg-zinc-200/5 bg-transparent dark:opacity-[0.8] rounded-md border border-solid border-neutral-200 dark:border-zinc-600' />
      )}
      {collection.issues.map((issue, idx) => (
        <img
          className={`w-full h-full bg-zinc-200/5 dark:opacity-[0.8] rounded-md border border-solid border-neutral-200 dark:border-zinc-600 absolute z-${idx}`}
          src={issue.thumbnailUrl}
          key={issue.id}
          alt={`issue_th_${issue.id}__${issue.issueTitle}`}
        />
      ))}
      <span className='text-sm text-neutral-400 font-medium w-full'>
        {collection.collectionName}
      </span>
    </div>
  );
}
