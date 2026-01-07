import global from '@state';
import { Moon, Sun } from '@solar-icons/react';
import { useGlobalState } from '../state/global';

export default function ThemeButton() {
  const colorMode = global.app.use.colorMode();

  const toggleColorMode = useGlobalState((state) => state.toggleColorMode);

  return (
    <button
      type='button'
      className='p-2 rounded-md cursor-pointer dark:text-moonlightWhite hover:bg-neutral-400/10 dark:hover:bg-neutral-400/5'
      onClick={toggleColorMode}
    >
      {colorMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
