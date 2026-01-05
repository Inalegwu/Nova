import global from '@state';
import { Moon, Sun } from '@solar-icons/react';

export default function ThemeButton() {
  const colorMode = global.app.use.colorMode();
  return (
    <button
      type='button'
      className='p-2 rounded-md cursor-pointer dark:text-moonlightWhite hover:bg-neutral-400/10 dark:hover:bg-neutral-400/5'
      onClick={() => global.app.use.toggleColorMode()()}
    >
      {colorMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
