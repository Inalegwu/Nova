import { useObservable } from "@legendapp/state/react";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { memo, useEffect, useState } from "react";
import { Icon } from "../components";
import { useDebounce, useKeyPress, useTimeout } from "../hooks";
import { globalState$ } from "../state";
import { Flex, Text } from "@kuma-ui/core";

export const Route = createLazyFileRoute("/first-launch")({
  component: memo(Component),
});

const DRAG_BUFFER = 50;

const welcomeMessages = [
  {
    id: 0,
    title: "Welcome To Vision",
    subtitle: "Your Comic Book Reader from The Future 🔮",
  },
  {
    id: 1,
    title: "Sleek and Modern",
    subtitle: "Designed to be Beautiful 💅🏾",
  },
  {
    id: 2,
    title: "Built for Speed",
    subtitle: "Enjoy your comics now 🏃🏾‍♂️‍➡️",
  },
];

function Component() {
  const dragX = useMotionValue(0);
  const [itemIndex, setItemIndex] = useState<number>(0);
  const info = useObservable(true);

  useTimeout(() => {
    info.set(false);
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
    globalState$.isFullscreen.set(true);
  }, []);

  useKeyPress(debounceKeyPress);

  return (
    <Flex className="w-full h-screen bg-white dark:bg-moonlightBase relative">
      <AnimatePresence>
        {info.get() && (
          <motion.div
            initial={{
              transform: "translateY(-50px)",
            }}
            animate={{
              transform: "translateY(9px)",
            }}
            exit={{
              transform: "translateY(-50px)",
            }}
            className="absolute top-[2%] left-[40.5%] bg-moonlightOrange/10 px-3 py-1 rounded-full text-moonlightText border-1 border-solid border-moonlightOrange/30"
          >
            <Text as="p">
              Press{" "}
              <Text color="orange" className="mx-2">
                [
              </Text>
              and
              <Text color="orange" className="mx-2">
                ]
              </Text>
              or <span className="text-moonlightOrange font-bold">Drag</span> to
              navigate
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, top: -100, left: -100 }}
        animate={{ opacity: 1, scale: 1, top: 0, left: 0 }}
        className="w-100 h-100 rounded-full absolute z-0 bg-moonlightOrange/70 blur-[160px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0, top: 0, left: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          top: 400,
          left: 1100,
        }}
        className="w-100 h-100 rounded-full absolute z-0 bg-moonlightOrange/70 blur-[160px]"
      />
      <Flex className="w-full h-full absolute z-10 bg-transparent backdrop-blur-9xl">
        <AnimatePresence mode="wait">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x: dragX }}
            initial={{ translateX: 0 }}
            animate={{
              translateX: `-${itemIndex * 100}%`,
            }}
            exit={{ translateX: 0 }}
            onDragEnd={onDragEnd}
            transition={{
              bounceDamping: 10,
            }}
            className="flex cursor-grab w-full h-full active:cursor-grabbing items-center"
          >
            {welcomeMessages.map((message) => (
              <Flex
                alignItems="center"
                justifyContent="center"
                key={message.id}
                gap="1"
                className="w-full h-full shrink-0"
              >
                <Text as="h3" className="text-moonlightOrange">
                  {message.title}
                </Text>
                <Text as="p" color="gray">
                  {message.subtitle}
                </Text>
              </Flex>
            ))}
          </motion.div>
        </AnimatePresence>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="center"
        gap="2"
        className="absolute z-10 bottom-[3%] left-[49%] p-2"
      >
        {welcomeMessages.map((m, idx) => (
          <div
            onClick={() => setItemIndex(idx)}
            className={`px-1 py-1 flex items-center justify-center rounded-full ${
              itemIndex === idx ? "bg-moonlightOrange" : "bg-moonlightOverlay/5"
            } cursor-pointer`}
            key={m.id}
          >
            <Icon name="Asterisk" className="opacity-0" size={12} />
          </div>
        ))}
        <AnimatePresence>
          {itemIndex === welcomeMessages.length - 1 && (
            <motion.div
              initial={{ opacity: 0, display: "none", scale: 0 }}
              animate={{ opacity: 1, display: "flex", scale: 1 }}
              exit={{ opacity: 0, display: "none", scale: 0 }}
            >
              <Link
                to="/"
                onClick={() => {
                  globalState$.isFullscreen.set(false);
                  globalState$.firstLaunch.set(false);
                }}
                className="px-1 flex items-center justify-center py-1 rounded-full text-moonlightWhite bg-moonlightOrange cursor-pointer"
              >
                <Icon name="ChevronRight" size={12.4} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </Flex>
  );
}
