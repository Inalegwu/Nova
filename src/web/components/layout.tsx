import { Dialog } from '@base-ui/react/dialog';
import { Tabs } from '@base-ui/react/tabs';
import { useRouter, useRouterState } from '@tanstack/react-router';
import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import logo_light from '@/assets/images/win_dark.png';
import logo_dark from '@/assets/images/win_light.png';
import t from '@/shared/config';
import { useInterval, useWindow } from '../hooks';
import { useGlobalState } from '../state/global';
import { Icon } from './atoms';

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const utils = t.useUtils();
  const routerState = useRouterState();
  const router = useRouter();

  const { mutate: maximize } = t.window.maximize.useMutation();
  const { mutate: close } = t.window.closeWindow.useMutation();
  const { mutate: add } = t.issue.addIssue.useMutation();

  t.taskProgress.useSubscription(undefined, {
    onData: (d) => {
      console.log(d);
    },
  });

  const isHome = routerState.location.pathname === '/';
  const colorMode = useGlobalState((s) => s.colorMode);
  const toggleColorMode = useGlobalState((s) => s.toggleColorMode);
  const isFirstLaunch = useGlobalState((s) => s.firstLaunch);

  useEffect(() => {
    if (colorMode === 'light') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [colorMode]);

  useEffect(() => {
    toast.dismiss();
    utils.invalidate();
  }, []);

  useEffect(() => {
    if (isFirstLaunch) {
      router.navigate({
        to: '/first-launch',
      });
    }
  }, []);

  useWindow('keypress', (e) => {
    if (e.keyCode === 16) {
      console.log('search command pressed');
    }
  });

  useInterval(() => {
    utils.library.getLibrary.invalidate();
  }, 10_000);

  return (
    <div className='flex flex-col w-full h-screen transition overflow-hidden'>
      <div className='w-full flex items-center bg-ground px-3 py-1 justify-between border-b-2 border-b-line'>
        <div className='flex items-center justify-start gap-3'>
          <button className='p-1' onClick={() => close()}>
            <Icon name='X' size={14} weight='bold' />
          </button>
          <img
            src={colorMode === 'light' ? logo_light : logo_dark}
            className='size-4'
            alt='logo'
          />
          <button className='p-1' onClick={() => add()}>
            <Icon name='Plus' size={14} weight='bold' />
          </button>
          {!isHome && (
            <div className='flex items-center justify-center gap-2'>
              <button className='p-1' onClick={() => window.navigation.back()}>
                <Icon name='ArrowLeft' size={16} />
              </button>
            </div>
          )}
        </div>
        <div id='drag-region' className='p-3 w-[85%]' />
        <div className='flex items-center justify-end gap-3'>
          <button className='p-1' onClick={toggleColorMode}>
            <Icon
              name={colorMode === 'light' ? 'Moon' : 'Sun'}
              size={14}
              weight='fill'
            />
          </button>
          <Dialog.Root>
            <Dialog.Trigger className='p-1'>
              <Icon name='GearFine' size={14} weight='fill' />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className='fixed z-20 inset-0 min-h-dvh bg-[#000000] opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute' />
              <Dialog.Popup className='fixed top-1/2 z-50 left-1/2 -mt-8 w-xl max-w-[calc(100vw-1rem)] max-h-90 min-h-45 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-panel rounded-xl border-2 border-line transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0'>
                <SettingsView />
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
          <button className='p-1' onClick={() => maximize()}>
            <Icon name='ArrowsOutSimple' weight='bold' size={14} />
          </button>
        </div>
      </div>
      <div className='w-full h-full bg-panel'>{children}</div>
    </div>
  );
}

function SettingsView() {
  return (
    <Tabs.Root defaultValue='appearance' className='w-full h-full'>
      <Tabs.List className='w-full flex items-center justify-center border-b border-b-line'>
        <Tabs.Tab
          className='w-full border-r border-r-line flex items-center justify-center text-sm p-1.5'
          value='appearance'
        >
          Appearance
        </Tabs.Tab>
        <Tabs.Tab
          className='w-full flex items-center justify-center text-sm p-1.5'
          value='storage'
        >
          Storage
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value='appearance' className='flex flex-col'>
        <div className='w-full flex border-b border-b-line px-3 py-3 items-center justify-between'>
          <span className='text-sm'>Accent Color</span>
          <div className='flex items-center justify-end gap-2'>
            <div className='bg-[#ECECEC] border border-line cursor-pointer rounded-full p-2.5' />
            <div className='bg-[#FFEC55] border border-line rounded-full cursor-pointer p-2.5' />
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value='storage' className='p-3'>
        storage
      </Tabs.Panel>
    </Tabs.Root>
  );
}
