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
import { useState } from 'react';
import { Spinner, Ticker } from '@/web/components';
import { Icon } from '@/web/components/atoms';
import {
  useComicFolder,
  useComicPage,
  useKeyPress,
  usePreloadPages,
} from '@/web/hooks';

export const Route = createFileRoute('/read/$issueId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();

  const [expanded, setExpanded] = useState(true);

  const readerDirection = global.reader.use.direction();
  const setReaderDirection = global.reader.use.setReaderDirection();
  const toggleFullscreen = global.app.use.setFullScreen();
  const fullscreen = global.app.use.isFullscreen();

  const { pageCount, status: folderStatus } = useComicFolder(issueId);
  const [pageIndex, setPageIndex] = useState(0);

  const { canvasRef, error, status } = useComicPage(pageIndex, issueId);
  usePreloadPages(pageIndex, [1, 2, -1], issueId, pageCount);

  useKeyPress((e) => {
    if (e.keyCode === 93 && pageIndex < pageCount) {
      setPageIndex((idx) => idx + 1);
    } else if (e.keyCode === 91 && pageCount) {
      setPageIndex((idx) => idx - 1);
    }
  });

  if (status === 'error')
    throw new Error(error?._tag, {
      cause: error?.cause,
    });

  if (folderStatus !== 'loaded') {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className='relative w-full h-screen'>
      <canvas
        id='readerRenderer'
        style={{
          cursor: 'grab',
          touchAction: 'none',
          width: '100%',
          height: '100%',
        }}
        ref={canvasRef}
        className='w-full h-full absolute z-0'
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
          onClick={() => console.log('saving...')}
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
          progress={(pageIndex / pageCount) * 100}
        />
      </div>
    </div>
  );
}
