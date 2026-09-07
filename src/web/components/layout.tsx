import { Button, Tabs } from '@base-ui/react';
import {
  AddSquare,
  ArrowLeft,
  ArrowRight,
  Book,
  CloseCircle,
  History,
  Home,
  Library,
  MaximizeSquare3,
  MinusSquare,
  Settings,
} from '@solar-icons/react';
import global from '@state';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import icon_dark from '@/assets/images/win_dark.png';
import icon_light from '@/assets/images/win_light.png';
import t from '@/shared/config';
import { useInterval, useWindow } from '../hooks';
import ThemeButton from './theme-button';
import { Link } from './ui/link';

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
  const [mouseOver, setMouseOver] = useState(false);

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
        className='bg-primary-50/40 dark:bg-neutral-950 flex flex-col w-full h-screen p-2 space-y-2 root'
      >
        {/*titlebar*/}
        <motion.div
          className='w-full flex items-center justify-between gap'
          initial={{ height: '0%', display: 'none' }}
          onMouseOver={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
          animate={{
            height: showTop ? '3%' : '0%',
            display: showTop ? 'flex' : 'none',
          }}
        >
          <div className='flex items-center justify-start space-x-3'>
            <div className='flex items-center justify-start space-x-3'>
              <img
                src={colorMode === 'dark' ? icon_dark : icon_light}
                alt='icon'
                className='w-5 h-5'
              />
              <div className='flex items-center justify-center space-x-2'>
                <Link
                  to='/'
                  className='bg-white dark:bg-neutral-800 rounded-md p-1 text-black dark:text-neutral-300 disabled:text-neutral-400 disabled:bg-transparent'
                >
                  <Home size={13} weight='Linear' />
                </Link>
                <Button
                  disabled={!!isHome}
                  onClick={() => navigation.history.back()}
                  className='bg-white dark:bg-neutral-800 rounded-md p-1 text-black dark:text-neutral-300 disabled:text-neutral-400 disabled:bg-transparent'
                >
                  <ArrowLeft size={13} weight='Linear' />
                </Button>
                <Button
                  onClick={() => navigation.history.forward()}
                  className='bg-white dark:bg-neutral-800 dark:text-neutral-300 rounded-md p-1'
                >
                  <ArrowRight size={13} weight='Linear' />
                </Button>
              </div>
            </div>
            <Tabs.List className='flex items-center justify-start space-x-2'>
              <Tabs.Tab className='tabTrigger' value='issues'>
                <Book size={13} />
                <span>Issues</span>
              </Tabs.Tab>
              <Tabs.Tab className='tabTrigger' value='collections'>
                <Library size={13} />
                <span>Collections</span>
              </Tabs.Tab>
            </Tabs.List>
            <div className='flex items-center justify-start gap-2'>
              <Button
                onClick={() => addIssue()}
                className='bg-white dark:bg-neutral-900 dark:text-neutral-300 rounded-md corner-superellipse/1.3 p-1'
              >
                <AddSquare weight='Bold' size={17} />
              </Button>
              <Link
                href='/history'
                className='bg-white dark:bg-neutral-900 dark:text-neutral-300 rounded-md corner-superellipse/1.3 p-1'
              >
                <History weight='Bold' size={17} />
              </Link>
            </div>
          </div>
          <div className='p-2 w-3/6' id='drag-region' />
          <div className='flex items-center justify-end space-x-3 text-neutral-500'>
            <ThemeButton />
            <Link to='/settings'>
              <Settings weight='Bold' size={15} />
            </Link>
            <Button onClick={() => minimize()}>
              <MinusSquare weight='Bold' size={15} />
            </Button>
            <Button onClick={() => maximize()}>
              <MaximizeSquare3 weight='Bold' size={15} />
            </Button>
            <Button className='text-red-800' onClick={() => close()}>
              <CloseCircle weight='Bold' size={15} />
            </Button>
          </div>
        </motion.div>
        <motion.div
          className='bg-white flex gap-2 overflow-hidden dark:bg-neutral-900 overflow-y-scroll overflow-x-hidden dark:text-neutral-200 w-full corner-superellipse/1.3'
          initial={{
            height: '100%',
            borderRadius: '0.375rem',
          }}
          animate={{
            height: showTop ? '97%' : '100%',
            borderRadius: isFullScreen ? '0' : '0.375rem',
          }}
        >
          {children}
        </motion.div>
      </Tabs.Root>
    </AnimatePresence>
  );
}
