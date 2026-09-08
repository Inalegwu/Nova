import { Button, Tabs } from '@base-ui/react';
import { Home, Library } from '@solar-icons/react';
import global from '@state';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { AnimatePresence } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import t from '@/shared/config';
import { useInterval, useWindow } from '../hooks';
import { Icon } from './atoms';

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const utils = t.useUtils();
  const navigation = useRouter();
  const routerState = useRouterState();

  const { mutate: minimize } = t.window.minimize.useMutation();
  const { mutate: maximize } = t.window.maximize.useMutation();
  const { mutate: close } = t.window.closeWindow.useMutation();
  const { mutate: addIssue } = t.issue.addIssue.useMutation();
  t.library.launchWatcher.useMutation();

  const isHome = routerState.location.pathname === '/';
  const lastOpenedTab = global.app.use.lastOpenedTab();
  const colorMode = global.app.use.colorMode();
  const isFullScreen = global.app.use.isFullscreen();
  const [showTop, setShowTop] = useState(false);
  const [mouseOver] = useState(false);

  // track the process of adding issues to the library
  // from background processes
  t.additions.useSubscription(undefined, {
    onData: (data) => {
      console.log({ data });
      if (!data.isCompleted && data.state === 'SUCCESS') {
        toast.success(`Adding ${data.issue || 'issue'} To Library`);
      }

      if (data.isCompleted && data.state === 'SUCCESS') {
        toast.success(`Added ${data.issue || 'issue'} to library`);
        utils.library.getLibrary.invalidate();
      }

      if (data.isCompleted && data.state === 'ERROR') {
        console.log(data.error);
        toast.error(data.error || 'Something went wrong');
      }

      if (!data.isCompleted && data.state === 'ERROR') {
        toast.error(data.error || 'Unknown Error Occurred');
      }

      return;
    },
  });

  // track the process of deleting issues from the library
  // from background processes
  t.deletions.useSubscription(undefined, {
    onData: (data) => {
      if (!data.isDone) {
        toast.info(`deleting ${data.title} from my Library`);
      }

      if (!data.isDone && data.error) {
        toast.error(data.error);
      }

      if (data.isDone) {
        toast.success(`${data.title} has been deleted`);
        utils.library.invalidate();
        toast.dismiss();
      }
    },
  });

  // deeplinks
  // t.deeplink.useSubscription(undefined, {
  //   onData: () => utils.library.invalidate(),
  // });

  useEffect(() => {
    if (colorMode === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      // globalState$.colorMode.set("dark");
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }, [colorMode]);

  useEffect(() => {
    toast.dismiss();
  }, []);

  useWindow('mousemove', (e) => {
    if (e.clientY < 20 && !isFullScreen) {
      setShowTop(true);
    } else {
      setShowTop(false);
    }
  });

  useWindow('keypress', (e) => {
    if (e.keyCode === 16) {
      console.log('search command pressed');
    }
  });

  useInterval(() => {
    if (showTop && !mouseOver) {
      setShowTop(false);
    }
  }, 5000);

  useInterval(() => {
    utils.library.getLibrary.invalidate();
  }, 10_000);

  return (
    <AnimatePresence>
      <Tabs.Root
        defaultValue={lastOpenedTab}
        className='flex flex-col w-full h-screen root'
      >
        {/*titlebar*/}
        <div className='w-full flex items-center justify-between gap border-b border-b-solid border-b-neutral-900'>
          <div className='flex items-center justify-start'>
            <div className='flex items-center justify-start'>
              <Link
                to='/'
                className='p-2.5 border-r border-r-solid border-r-neutral-900'
              >
                <Home size={15} weight='Linear' />
              </Link>
              <button
                disabled={!!isHome}
                onClick={() => navigation.history.back()}
                className='p-2.5 border-r border-r-solid border-r-neutral-900'
              >
                <Icon name='ArrowLeft' size={15} />
              </button>
              <button
                onClick={() => navigation.history.forward()}
                className='p-2.5 border-r border-r-solid border-r-neutral-900'
              >
                <Icon name='ArrowRight' size={15} />
              </button>
            </div>
            <Tabs.List className='flex items-center justify-start'>
              <Tabs.Tab className='tabTrigger' value='issues'>
                <Icon name='Book' size={15} />
              </Tabs.Tab>
              <Tabs.Tab className='tabTrigger' value='collections'>
                <Library weight='Linear' size={15} />
              </Tabs.Tab>
            </Tabs.List>
            <div className='flex items-center justify-start gap-2'>
              <Button
                onClick={() => addIssue()}
                className='p-2.5 border-r border-r-solid border-r-neutral-900'
              >
                <Icon name='Plus' size={15} />
              </Button>
              <Link
                to='/history'
                className='p-2.5 border-r border-r-solid border-r-neutral-900'
              >
                <Icon name='ClockCounterClockwise' size={15} />
              </Link>
            </div>
          </div>
          <div className='p-2 w-3/6' id='drag-region' />
          <div className='flex items-center justify-end text-neutral-500'>
            <Link
              className='p-2.5 border-l border-l-solid border-l-neutral-900'
              to='/settings'
            >
              <Icon name='Gear' size={15} />
            </Link>
            <button
              className='p-2.5 border-l border-l-solid border-l-neutral-900'
              onClick={() => minimize()}
            >
              <Icon name='Minus' size={15} />
            </button>
            <button
              className='p-2.5 border-l border-l-solid border-l-neutral-900'
              onClick={() => maximize()}
            >
              <Icon name='CornersOut' size={15} />
            </button>
            <button
              className='text-red-800 p-2.5 border-l border-l-solid border-l-neutral-900'
              onClick={() => close()}
            >
              <Icon name='X' size={15} />
            </button>
          </div>
        </div>
        <div className='flex gap-2 overflow-hidden overflow-y-scroll overflow-x-hidden w-full corner-superellipse/1.3'>
          {children}
        </div>
      </Tabs.Root>
    </AnimatePresence>
  );
}
