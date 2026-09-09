import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@base-ui/react/toolbar';
import {
  SliderMinimalisticHorizontal,
  SliderVerticalMinimalistic,
} from '@solar-icons/react';
import global from '@state';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import t from '@/shared/config';
import { CanvasRenderer, Spinner, Ticker } from '@/web/components';
import { Icon } from '@/web/components/atoms';
import { useInterval, useKeyPress, useTimeout } from '@/web/hooks';
import { historyCollection } from '@/web/store/history';

export const Route = createFileRoute('/read/$issueId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();

  const [isEnabled, setIsEnabled] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const readerDirection = global.reader.use.direction();
  const setReaderDirection = global.reader.use.setReaderDirection();
  const toggleFullscreen = global.app.use.setFullScreen();
  const fullscreen = global.app.use.isFullscreen();

  const { data, isLoading: fetchingPages } = t.issue.getPages.useQuery(
    {
      issueId,
    },
    {
      enabled: isEnabled,
    },
  );

  useTimeout(() => setIsEnabled(true), 500);

  const contentLength = data?.pages.length || 0;
  const [itemIndex, setItemIndex] = useState(0);

  useInterval(() => {
    const exists = historyCollection.get(issueId);

    if (exists) {
      console.log('updating...');
      historyCollection.update(issueId, (draft) => {
        draft.currentPage === itemIndex;
      });
      return;
    }

    console.log('inserting into history');
    historyCollection.insert({
      id: issueId,
      thumbnail: data?.pages[0].data || '',
      title: data?.issue.issueTitle || '',
      lastRead: new Date().toString(),
      currentPage: itemIndex + 1,
      totalPages: contentLength,
      status:
        itemIndex === Math.floor(contentLength / 2)
          ? ('half-way' as const)
          : itemIndex === contentLength
            ? ('done' as const)
            : ('currently-reading' as const),
    });

    return;
  }, 3000);

  useKeyPress((e) => {
    if (e.keyCode === 93 && itemIndex < contentLength) {
      setItemIndex((idx) => idx + 1);
    } else if (e.keyCode === 91 && itemIndex > 0) {
      setItemIndex((idx) => idx - 1);
    }
  });

  const saveBookmark = useCallback(() => {
    console.log('saving bookmark');
  }, []);

  if (fetchingPages) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className='relative w-full h-screen'>
      <CanvasRenderer
        index={itemIndex}
        setIndex={setItemIndex}
        className='w-full h-full absolute z-0'
        images={data?.pages?.map((page) => page.data) || []}
      />
      <Toolbar.Root
        render={<motion.div animate={{ width: expanded ? '15.6%' : '2.6%' }} />}
        className='flex overflow-hidden absolute z-10 top-2 right-2 bg-neutral-950 border border-solid border-neutral-900'
      >
        <motion.button
          onClick={() => setExpanded((ex) => !ex)}
          className='toolbarToggle'
        >
          <Icon name={expanded ? 'CaretRight' : 'CaretLeft'} size={13} />
        </motion.button>
        <ToggleGroup
          render={
            <motion.div
              animate={{
                transform: expanded ? 'translateX(0px)' : 'translateX(130px)',
                display: expanded ? 'flex' : 'none',
              }}
            />
          }
          className='flex'
        >
          <Toolbar.Button
            onClick={() => setReaderDirection('vertical')}
            className='toolbarToggle'
            render={<Toggle pressed={readerDirection === 'vertical'} />}
            aria-label='reader-vertical'
          >
            <SliderVerticalMinimalistic
              weight={readerDirection === 'vertical' ? 'Bold' : 'Outline'}
              size={13}
            />
          </Toolbar.Button>
          <Toolbar.Button
            onClick={() => setReaderDirection('horizontal')}
            className='toolbarToggle'
            render={<Toggle pressed={readerDirection === 'horizontal'} />}
            aria-label='reader-vertical'
          >
            <SliderMinimalisticHorizontal
              weight={readerDirection === 'horizontal' ? 'Bold' : 'Outline'}
              size={13}
            />
          </Toolbar.Button>
        </ToggleGroup>
        <Toolbar.Button
          onClick={saveBookmark}
          render={
            <Toggle
              render={
                <motion.button
                  animate={{ display: expanded ? 'flex' : 'none' }}
                />
              }
            />
          }
          className='toolbarToggle'
        >
          <Icon name='Bookmark' size={13} />
        </Toolbar.Button>
        <Toolbar.Button
          render={
            <Toggle
              render={
                <motion.button
                  animate={{ display: expanded ? 'flex' : 'none' }}
                />
              }
            />
          }
          className='toolbarToggle'
        >
          <Icon name='Heart' size={13} />
        </Toolbar.Button>
        <Toolbar.Button
          render={
            <Toggle
              render={
                <motion.button
                  onClick={() => toggleFullscreen(!fullscreen)}
                  animate={{ display: expanded ? 'flex' : 'none' }}
                />
              }
            />
          }
          className='toolbarToggle'
        >
          <Icon name='CornersOut' size={13} />
        </Toolbar.Button>
      </Toolbar.Root>
      <div className='absolute z-30 bottom-9 left-0 w-full p-2 items-center justify-center'>
        <Ticker
          borderColor='#262626'
          height={20}
          tickCount={300}
          progress={(itemIndex / contentLength) * 100}
        />
      </div>
    </div>
  );
}
