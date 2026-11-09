import { useRouter } from '@tanstack/react-router';
import * as A from 'effect/Array';
import moment from 'moment';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 345;
const STEP = 7;

type CollectionProp = Partial<Collection> & {
  issues: Array<Partial<Issue>>;
};

export default function Collection(collection: CollectionProp) {
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
      className='cursor-pointer flex items-center justify-center p-2'
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
              className='absolute border border-b-0 bg-ground/40 backdrop-blur-3xl rounded-2xl border-solid border-line'
              style={{
                top: STEP * i + 10,
                left: (CARD_WIDTH - width) / 2,
                width,
                height: STEP + 20,
                zIndex: i,
                opacity,
                borderColor: 'var(--line)',
              }}
            />
          );
        })}
        <div
          className={`absolute left-0 border border-solid bg-cover bg-center border-line bg-ink/20 dark:bg-panel/10 rounded-2xl overflow-hidden`}
          style={{
            top: STEP * count,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            zIndex: count,
            backgroundImage: `url(${front?.thumbnailUrl})`,
          }}
        >
          <div className='flex h-full flex-col justify-end px-3 py-2 bg-ink/55 dark:bg-ground/30'>
            <div>
              <h2 className='text-[11px] uppercase font-extrabold text-ground dark:text-ink mb-1'>
                {collection.collectionName}
              </h2>
              <p className='text-xs font-medium text-dim'>
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
