import { Link, useRouterState } from '@tanstack/react-router';
import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import logo from '@/assets/images/win_dark.png';
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

  const { mutate: maximize } = t.window.maximize.useMutation();
  const { mutate: close } = t.window.closeWindow.useMutation();
  const { mutate: add } = t.issue.addIssue.useMutation();

  const isHome = routerState.location.pathname === '/';
  const colorMode = useGlobalState((s) => s.colorMode);
  const toggleColorMode = useGlobalState((s) => s.toggleColorMode);

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
    <div className='flex flex-col w-full h-screen transition'>
      <div className='w-full flex items-center bg-ground px-3 py-1 justify-between border-b-2 border-b-line'>
        <div className='flex items-center justify-start gap-4'>
          <button onClick={() => close()}>
            <Icon name='X' size={16} />
          </button>
          <img src={logo} className='size-4' alt='logo' />
          <button onClick={() => add()}>
            <Icon name='Plus' size={16} />
          </button>
          {!isHome && (
            <>
              <button onClick={() => window.navigation.back()}>
                <Icon name='ArrowLeft' size={16} />
              </button>
              <button>
                <Icon name='Sidebar' weight='fill' size={16} />
              </button>
            </>
          )}
        </div>
        <div id='drag-region' className='p-3 w-full' />
        <div className='flex items-center justify-end gap-5'>
          <button onClick={toggleColorMode}>
            <Icon
              name={colorMode === 'light' ? 'Moon' : 'Sun'}
              size={16}
              weight='fill'
            />
          </button>
          <button onClick={() => maximize()}>
            <Icon name='ArrowsOutSimple' size={16} />
          </button>
        </div>
      </div>
      <div className='w-full h-full bg-panel'>{children}</div>
    </div>
  );
}
