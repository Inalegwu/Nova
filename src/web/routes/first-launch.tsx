import { Icon } from '@atoms';
import { createFileRoute, Link } from '@tanstack/react-router';
import { capitalize } from 'effect/String';
import { memo, useEffect } from 'react';
import t from '@/shared/config';
import { useGlobalState } from '../state/global';

export const Route = createFileRoute('/first-launch')({
  component: memo(Component),
});

// TODO: stepper setup screen
function Component() {
  const toggleColorMode = useGlobalState((s) => s.toggleColorMode);
  const colorMode = useGlobalState((s) => s.colorMode);
  const sourceDirectory = useGlobalState((s) => s.sourceDirectory);
  const setSourceDirectory = useGlobalState((s) => s.setSourceDir);
  const updateFirstLaunchStatus = useGlobalState((s) => s.updateFirstLaunch);

  const { mutate, isPending } = t.pickSourceDirectory.useMutation({
    onSuccess: (d) => {
      // no need to set it to null again
      if (d.path === null) return;
      console.log(d);
      setSourceDirectory(d.path);
    },
  });

  useEffect(() => {
    // ENSURE THE USER DOESN'T GET BACK HERE
    updateFirstLaunchStatus();
  }, []);

  useEffect(() => {
    if (colorMode === 'light') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [colorMode]);

  return (
    <div className='flex flex-col gap-10 items-center justify-center w-full h-screen bg-panel transition'>
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-3xl font-bold'>Welcome to Nova</h1>
        <span className='text-sm text-dim font-medium'>
          Just get some things ready before you start reading
        </span>
      </div>
      <div className='flex items-center bg-ground rounded-xl border h-2/6 w-4/6'>
        <div className='w-full h-full gap-7 border-r p-3 flex flex-col items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-sm font-medium'>Default Theme</span>
            <span className='text-xs text-dim'>
              You can always change this later
            </span>
          </div>
          <button
            onClick={toggleColorMode}
            className='text-xs bg-panel rounded-lg shadow font-medium border px-6 py-1.25'
          >
            {capitalize(colorMode)}
          </button>
        </div>
        <div className='w-full h-full border-r px-7 py-3 gap-7 flex flex-col items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-sm font-medium'>Comics Directory</span>
            <span className='text-xs text-dim text-center'>
              Where should Nova look for comics
            </span>
          </div>
          <button
            disabled={isPending}
            onClick={() => mutate()}
            className='text-xs bg-panel rounded-lg shadow font-medium border px-6 py-1.25'
          >
            {sourceDirectory === null ? 'Choose a folder' : sourceDirectory}
          </button>
        </div>
        <div className='w-full h-full p-3 flex flex-col gap-7 items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-sm font-medium'>Accent Color</span>
            <span className='text-xs text-dim text-center'>
              How do you want Nova to look
            </span>
          </div>
          <button className='text-xs bg-panel rounded-lg shadow font-medium border px-6 py-1.25'>
            idk
          </button>
        </div>
      </div>
      <div className='my-5 flex items-center justify-center gap-5'>
        <Link
          className='flex bg-ground px-5 py-1.25 rounded-lg border text-sm items-center justify-center gap-2'
          to='/'
        >
          <span>Get Started</span>
        </Link>
        <Link
          className='flex text-xs px-4 py-1.25 hover:bg-ground/50 transition rounded-lg items-center justify-center gap-2'
          to='/'
        >
          <span>Skip</span>
          <Icon name='ArrowRight' size={12} />
        </Link>
      </div>
    </div>
  );
}
