import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion, useMotionValue } from 'motion/react';
import { memo, useEffect, useState } from 'react';
import { useDebounce, useKeyPress, useTimeout } from '../hooks';
import global from '@state';
import { SquareArrowRight } from '@solar-icons/react';

export const Route = createLazyFileRoute('/first-launch')({
  component: memo(Component),
});

const DRAG_BUFFER = 50;

const welcomeMessages: Array<WelcomeMessage> = [
  {
    id: 0,
    title: 'Welcome To Nova',
    subtitle: 'Your Comic Book Reader from The Future 🔮',
  },
  {
    id: 1,
    title: 'Sleek and Modern',
    subtitle: 'Designed to be Beautiful 💅🏾',
  },
  {
    id: 2,
    title: 'Built for Speed',
    subtitle: 'Enjoy your comics now 🏃🏾‍♂️‍➡️',
  },
  {
    id: 3,
    title: 'Getting things setup',
    subtitle: 'Add your library to start reading immediately',
    render: () => <div className='w-full h-screen'>initial setup view</div>,
  },
];

// TODO: stepper setup screen
function Component() {
  const dragX = useMotionValue(0);
  const [itemIndex, setItemIndex] = useState<number>(0);
  const [info, setInfo] = useState(true);

  useTimeout(() => {
    setInfo(false);
  }, 3_000);

  const onDragEnd = () => {
    const x = dragX.get();

    if (x <= DRAG_BUFFER && itemIndex < welcomeMessages.length - 1) {
      setItemIndex((index) => index + 1);
    } else if (x >= DRAG_BUFFER && itemIndex > 0) {
      setItemIndex((index) => index - 1);
    }
  };

  const debounceKeyPress = useDebounce((e: KeyboardEvent) => {
    if (e.keyCode === 93 && itemIndex < welcomeMessages.length - 1) {
      setItemIndex((index) => index + 1);
    } else if (e.keyCode === 91 && itemIndex > 0) {
      setItemIndex((index) => index - 1);
    }
  }, 50);

  useEffect(() => {
    global.app.use.setFullScreen()(true);
  }, []);

  useKeyPress(debounceKeyPress);

  return (
    <div className='font-medium text-lg flex centered w-full h-full'>
      {welcomeMessages.map((message) =>
        message.render ? (
          <message.render key={message.id} />
        ) : (
          <div key={message.id}>{message.subtitle}</div>
        ),
      )}
    </div>
  );
}
