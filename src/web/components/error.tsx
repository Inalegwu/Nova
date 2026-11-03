import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Icon } from './atoms';

export default function ErrorComponent(props: ErrorComponentProps) {
  useEffect(() => {
    // console.error({ error: props.error, instanceId: appId });
  }, [props]);

  return (
    <div className='w-full h-screen flex gap-15 flex-col px-30 items-center justify-center'>
      <div className='w-full hazard h-24' />
      <div className='w-full flex flex-col items-start justify-center'>
        <h3 className='text-3xl font-extrabold'>Something went wrong</h3>
        <p className='text-red-600 font-medium'>{props.error.message}</p>
        <span className='bg-ground text-xs my-5 p-3 font-display border border-line rounded-xl shadow'>
          {props.error.stack}
        </span>
        <button
          className='px-5 py-1 text-xs gap-2 uppercase border border-solid border-line rounded-xl bg-ground shadow'
          onClick={() => props.reset()}
        >
          <span>reset</span>
          <Icon name='Warning' size={12} weight='bold' />
        </button>
      </div>
    </div>
  );
}
