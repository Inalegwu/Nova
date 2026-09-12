import { useRouter } from '@tanstack/react-router';
import * as A from 'effect/Array';
import moment from 'moment';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 260;
const STEP = 7;

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

export default function CollectionBox(collection: CollectionProp) {
  const nav = useRouter();
  const images = A.drop(collection.issues.length - 3)(collection.issues);

  const count = images.length;
  const back = images.slice(0, -1);
  const front = images[count - 1];

  return (
    <div
      onClick={() =>
        nav.navigate({
          to: '/$collectionId',
          params: {
            // @ts-expect-error: it exists
            collectionId: collection.id,
          },
        })
      }
      className='cursor-pointer flex items-center justify-center font-code mx-2 p-2'
    >
      <div
        className='relative'
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT + STEP * (count - 1),
        }}
      >
        {/* back cards: only the top sliver is rendered, so nothing can peek out below */}
        {back.map((record, i) => {
          const depth = count - 1 - i;
          const opacity = 1 - depth * 0.15;
          const scale = 1 - depth * 0.04;
          const width = CARD_WIDTH * scale;

          return (
            <div
              key={record.id}
              className='absolute border border-b-0 bg-neutral-800/30 border-solid border-neutral-800'
              style={{
                top: STEP * i + 10,
                left: (CARD_WIDTH - width) / 2,
                width,
                height: STEP,
                zIndex: i,
                opacity,
                borderColor: '#2a2a2a',
              }}
            />
          );
        })}
        <div
          className={`absolute left-0 border border-solid bg-cover bg-center border-neutral-800`}
          style={{
            top: STEP * count,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            zIndex: count,
            backgroundImage: `url(${front?.thumbnailUrl})`,
          }}
        >
          <div className='flex h-full bg-black/80 flex-col justify-between p-5'>
            <span className='text-[10px] uppercase tracking-wide text-neutral-400'>
              {collection.id} / {String(count).padStart(2, '0')}
            </span>
            <div>
              <h2 className='text-sm uppercase text-neutral-200 mb-1'>
                {collection.collectionName}
              </h2>
              <p className='text-xs text-accent/80'>
                {moment(front?.dateCreated).fromNow()}
              </p>
              <div className='h-px mt-4 w-full bg-[#2a2a2a]' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
