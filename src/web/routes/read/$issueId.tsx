import t from '@/shared/config';
import { CanvasRenderer, Spinner } from '@/web/components';
import { useKeyPress, useTimeout } from '@/web/hooks';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useMemo, useCallback } from 'react';
import { useMotionValue, motion } from 'motion/react';
import { Toolbar } from '@base-ui/react/toolbar';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import {
  Bookmark,
  Hearts,
  SliderMinimalisticHorizontal,
  SliderVerticalMinimalistic,
  AltArrowRight,
  RoundAltArrowRight,
  AltArrowLeft,
} from '@solar-icons/react';
import global from '@state';

const DRAG_BUFFER = 50;

export const Route = createFileRoute('/read/$issueId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();
  const nav = useRouter();

  const [isEnabled, setIsEnabled] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const readerDirection = global.reader.use.direction();
  const toggleReaderDirection = global.reader.use.toggleReaderDirection();
  const setReaderDirection = global.reader.use.setReaderDirection();

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
  const dragX = useMotionValue(0);
  const width = useMemo(
    () => Math.floor((itemIndex / contentLength) * 100),
    [itemIndex, contentLength],
  );

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= DRAG_BUFFER && itemIndex < contentLength) {
      setItemIndex((idx) => idx + 1);
    } else {
      setItemIndex((idx) => idx - 1);
    }
  };

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
        <Spinner className='border-4' size={50} />
      </div>
    );
  }

  return (
    <CanvasRenderer className="w-full h-full" images={data?.pages.map((page) => page.data) || []} />
  )

  // return (
  //   <div className='w-full h-full relative overflow-hidden min-h-screen'>
  //     <motion.div
  //       className='flex items-center'
  //       drag='x'
  //       style={{ x: dragX }}
  //       animate={{ translateX: `-${itemIndex * 100}%` }}
  //       transition={{ bounceDamping: 10 }}
  //       onDragEnd={onDragEnd}
  //       dragConstraints={{ left: 0, right: 0 }}
  //     >
  //       {data?.pages.map((page) => (
  //         <div
  //           key={page.id}
  //           className='w-full h-screen flex items-center justify-center shrink-0'
  //         >
  //           <img
  //             src={page.data}
  //             alt='page'
  //             className='aspect-9/16 h-full w-full object-contain'
  //           />
  //         </div>
  //       ))}
  //     </motion.div>
  //     {/*TODO:toolbar*/}
  //     <Toolbar.Root
  //       render={<motion.div animate={{ width: expanded ? '13.3%' : '2.3%' }} />}
  //       className='flex centered overflow-hidden absolute z-10 top-2 right-2 gap-1 bg-neutral-100 dark:bg-neutral-950 rounded-md squiricle'
  //     >
  //       <motion.button
  //         onClick={() => setExpanded((ex) => !ex)}
  //         className='p-2 flex centered'
  //       >
  //         {expanded ? (
  //           <AltArrowRight size={16} weight='Bold' />
  //         ) : (
  //           <AltArrowLeft size={16} weight='Bold' />
  //         )}
  //       </motion.button>
  //       <ToggleGroup
  //         render={
  //           <motion.div
  //             animate={{
  //               transform: expanded ? 'translateX(0px)' : 'translateX(130px)',
  //               display: expanded ? 'flex' : 'none',
  //             }}
  //           />
  //         }
  //         className='flex centered gap-1'
  //       >
  //         <Toolbar.Button
  //           onClick={() => setReaderDirection("vertical")}
  //           className='toolbarToggle'
  //           render={<Toggle pressed={readerDirection === 'vertical'} />}
  //           aria-label='reader-vertical'
  //         >
  //           <SliderVerticalMinimalistic
  //             weight={readerDirection === 'vertical' ? 'Bold' : 'Outline'}
  //             size={16}
  //           />
  //         </Toolbar.Button>
  //         <Toolbar.Button
  //           onClick={() => setReaderDirection("horizontal")}
  //           className='toolbarToggle'
  //           render={<Toggle pressed={readerDirection === 'horizontal'} />}
  //           aria-label='reader-vertical'
  //         >
  //           <SliderMinimalisticHorizontal
  //             weight={readerDirection === 'horizontal' ? 'Bold' : 'Outline'}
  //             size={16}
  //           />
  //         </Toolbar.Button>
  //       </ToggleGroup>
  //       <Toolbar.Button
  //         onClick={saveBookmark}
  //         render={
  //           <Toggle
  //             render={
  //               <motion.button
  //                 animate={{ display: expanded ? 'flex' : 'none' }}
  //               />
  //             }
  //           />
  //         }
  //         className='toolbarToggle'
  //       >
  //         <Bookmark weight='Outline' size={16} />
  //       </Toolbar.Button>
  //       <Toolbar.Button
  //         render={
  //           <Toggle
  //             render={
  //               <motion.button
  //                 animate={{ display: expanded ? 'flex' : 'none' }}
  //               />
  //             }
  //           />
  //         }
  //         className='toolbarToggle'
  //       >
  //         <Hearts weight='Outline' size={16} />
  //       </Toolbar.Button>
  //     </Toolbar.Root>
  //     <div className='absolute z-10 bottom-5 left-0 w-full p-2 items-center justify-center'>
  //       <div className='w-full bg-neutral-400/20 backdrop-blur-3xl squiricle'>
  //         <motion.div
  //           animate={{ width: `${width}%` }}
  //           className='squiricle bg-linear-to-r from-neutral-400/30 dark:from-neutral-100/30 to-fuchsia-300/30 p-2'
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
}
