import { useRouterState } from '@tanstack/react-router';
import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import logo from '@/assets/images/win_dark.png';
import t from '@/shared/config';
import { useInterval, useTaskProgress, useWindow } from '../hooks';
import { useGlobalState } from '../state/global';
import { Icon } from './atoms';

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const utils = t.useUtils();
  const routerState = useRouterState();

  const { mutate: maximize } = t.window.maximize.useMutation();
  const { mutate: close } = t.window.closeWindow.useMutation();
  const { mutate: add } = t.issue.addIssue.useMutation();

  const isHome = routerState.location.pathname === '/';
  const colorMode = useGlobalState((s) => s.colorMode);
  const toggleColorMode = useGlobalState((s) => s.toggleColorMode);

  const tasks = useTaskProgress();

  console.log(tasks);

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
          <img src={logo} className='size-4' alt='logo' />
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
          <button className='p-1' onClick={() => maximize()}>
            <Icon name='ArrowsOutSimple' weight='bold' size={14} />
          </button>
        </div>
      </div>
      <div className='w-full h-full bg-panel'>{children}</div>
    </div>
  );
}
