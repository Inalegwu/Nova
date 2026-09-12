import global from '@state';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function ErrorComponent(props: ErrorComponentProps) {
  const appId = global.app.use.appId();

  useEffect(() => {
    console.error({ error: props.error, instanceId: appId });
  }, [props]);

  return (
    <div className='w-full px-10 py-5 h-screen flex flex-col items-start justify-center'>
      <h3 className='text-3xl font-extrabold'>Something went wrong</h3>
      <p className='text-red-600 font-medium'>{props.error.message}</p>
      <span className='bg-neutral-950 text-sm my-5 p-3 font-display'>
        {props.error.stack}
      </span>
      <button
        className='px-5 py-1 text-sm uppercase border border-solid border-neutral-900'
        onClick={() => props.reset()}
      >
        reset
      </button>
    </div>
  );
}
