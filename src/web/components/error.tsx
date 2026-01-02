import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';
import { globalState$ } from '../state';

export default function ErrorComponent(props: ErrorComponentProps) {
  useEffect(() => {
    // TODO: aptabase for error reporting
    console.error({ error: props.error, instanceId: globalState$.appId.get() });
  }, [props]);

  return (
    <div className='w-full p-3 h-screen bg-neutral-100 text-black dark:bg-neutral-950 dark:text-neutral-300 flex flex-col items-start justify-center'>
      <h3 className='text-3xl font-bold'>Something went wrong</h3>
      <p className='text-red-600 font-medium'>{props.error.message}</p>
      <span className='bg-white text-sm my-5 p-3  dark:bg-neutral-900 rounded-md corner-superellipse/2 font-(--font-sans)'>
        {props.error.stack}
      </span>
      <button onClick={() => props.reset()}>reset</button>
    </div>
  );
}
