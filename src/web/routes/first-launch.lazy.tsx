import { useObservable } from "@legendapp/state/react";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { memo, useEffect, useState } from "react";
import { useDebounce, useKeyPress, useTimeout } from "../hooks";
import { globalState$ } from "../state";
import { SquareArrowRight } from "@solar-icons/react";

export const Route = createLazyFileRoute("/first-launch")({
  component: memo(Component),
});

const DRAG_BUFFER = 50;

const welcomeMessages = [
  {
    id: 0,
    title: "Welcome To Nova",
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

// TODO: stepper setup screen
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

  return <div className="font-medium text-lg">first launch screen</div>;
}
