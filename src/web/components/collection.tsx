import { useRouter } from '@tanstack/react-router';
import * as A from 'effect/Array';

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

export default function CollectionBox(collection: CollectionProp) {
  const nav = useRouter();

  const images = A.drop(collection.issues.length - 3)(collection.issues);

  return (
    <div
      onClick={() =>
        nav.navigate({
          href: '/$collectionId',
          params: {
            // @ts-expect-error: this definitely exists
            collectionId: collection.id,
          },
        })
      }
      className='w-50 h-75 mb-16 mt-3 cursor-pointer'
    >
      <div className='w-full h-full relative'>
        {images.length === 0 &&
          new Array(3).fill(0).map((_, idx) => (
            <div
              className={`w-full h-full absolute z-${
                idx * 10
              } border border-solid border-neutral-900 backdrop-blur-3xl`}
              style={{
                transform: `rotateZ(${
                  idx === 0 ? -1.5 : idx % 2 === 0 ? -idx * 1 : idx * 1
                }deg)`,
              }}
            />
          ))}
        {images.map((issue, idx) => (
          <img
            className={`w-full h-full absolute z-${
              idx * 10
            } border border-solid border-neutral-900`}
            style={{
              transform: `rotateZ(${
                idx === 0 ? -1.5 : idx % 2 === 0 ? -idx * 1 : idx * 1
              }deg)`,
            }}
            src={issue.thumbnailUrl}
            key={issue.id}
            alt={`issue_th_${issue.id}__${issue.issueTitle}`}
          />
        ))}
      </div>
      <div className='flex items-center justify-start mt-1'>
        <span className='text-[0.88rem] text-black dark:text-neutral-400 font-medium w-full'>
          {collection.collectionName}
        </span>
      </div>
    </div>
  );
}
