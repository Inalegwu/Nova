import { useRouter } from '@tanstack/react-router';
import * as A from 'effect/Array';
import moment from 'moment';

const CARD_WIDTH = 250;
const CARD_HEIGHT = 350;
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
      style={{
        height: CARD_HEIGHT,
      }}
      className='cursor-pointer flex items-center justify-center mx-2 p-2'
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
              className='absolute border border-b-0 bg-ground/30 rounded-2xl border-solid'
              style={{
                top: STEP * i + 10,
                left: (CARD_WIDTH - width) / 2,
                width,
                height: STEP + 20,
                zIndex: i,
                opacity,
                borderColor: 'var(--ink)',
              }}
            />
          );
        })}
        <div
          className={`absolute left-0 border border-solid bg-cover bg-center border-line bg-ground rounded-2xl overflow-hidden`}
          style={{
            top: STEP * count,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            zIndex: count,
            backgroundImage: `url(${front?.thumbnailUrl})`,
          }}
        >
          <div className='flex h-full flex-col justify-end px-3 py-2 bg-invert/20'>
            <div>
              <h2 className='text-[11px] uppercase font-extrabold text-neutral-200 mb-1 invert'>
                {collection.collectionName}
              </h2>
              <p className='text-xs uppercase font-bold text-accent/60 invert'>
                {moment(front?.dateCreated).fromNow()}
              </p>
              <div className='h-px mt-4 w-full bg-border-hi' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
