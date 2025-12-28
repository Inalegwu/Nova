import { computed } from "@legendapp/state";
import { useObservable, useObserveEffect } from "@legendapp/state/react";
import t from "@/shared/config";
import { useRouter, useRouterState } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { useInterval, useWindow } from "../hooks";
import { globalState$ } from "../state";
import { toast } from "sonner";
import icon from "@/assets/images/win.png";
import {
  CloseCircle,
  MaximizeSquare3,
  Library,
  Book,
  AddSquare,
  MinusSquare,
  Settings,
  ArrowLeft,
  ArrowRight,
} from "@solar-icons/react";
import { Tabs } from "@base-ui/react/tabs";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@base-ui/react/button";
import { Link } from "./ui/link";
import ThemeButton from "./theme-button";

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const utils = t.useUtils();
  const navigation = useRouter();
  const routerState = useRouterState();

  const { mutate: minimize } = t.window.minimize.useMutation();
  const { mutate: maximize } = t.window.maximize.useMutation();
  const { mutate: close } = t.window.closeWindow.useMutation();
  const { mutate: addIssue } = t.issue.addIssue.useMutation();

  // const isNotHome = computed(() => routerState.location.pathname !== "/").get();

  const isHome = routerState.location.pathname === "/";

  const [showTop, setShowTop] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  const continueReading = false;

  // track the process of adding issues to the library
  // from background processes
  t.additions.useSubscription(undefined, {
    onData: (data) => {
      if (!data.isCompleted && data.state === "SUCCESS") {
        toast.success(`Adding ${data.issue || "issue"} To Library`);
      }

      if (data.isCompleted && data.state === "SUCCESS") {
        toast.success(`Added ${data.issue || "issue"} to library`);
        utils.library.getLibrary.invalidate();
      }

      if (data.isCompleted && data.state === "ERROR") {
        console.log(data.error);
        toast.error(data.error || "Something went wrong");
      }

      if (!data.isCompleted && data.state === "ERROR") {
        toast.error(data.error || "Unknown Error Occurred");
      }

      return;
    },
  });

  // track the process of deleting issues from the library
  // from background processes
  t.deletions.useSubscription(undefined, {
    onData: (data) => {
      if (!data.isDone) {
        toast.info(`Removing ${data.title} from Library`);
      }

      if (!data.isDone && data.error) {
        toast.error(data.error);
      }

      if (data.isDone) {
        toast.success(`Successfully Removed ${data.title}`);
        utils.library.invalidate();
        toast.dismiss();
      }
    },
  });

  // deeplinks
  t.deeplink.useSubscription(undefined, {
    onData: () => utils.library.invalidate(),
  });

  useObserveEffect(() => {
    if (globalState$.colorMode.get() === "dark") {
      document.body.setAttribute("data-theme", "dark");
      // globalState$.colorMode.set("dark");
    } else {
      document.body.setAttribute("data-theme", "light");
      globalState$.colorMode.set("light");
    }
  });

  useWindow("mousemove", (e) => {
    if (e.clientY < 30) {
      setShowTop(true);
    } else {
      setShowTop(false);
    }
  });

  useWindow("keypress", (e) => {
    if (e.keyCode === 16) {
      console.log("search command pressed");
    }
  });

  useInterval(() => {
    if (showTop && !mouseOver) {
      setShowTop(false);
    }
  }, 3000);

  useEffect(() => {
    if (globalState$.isFullscreen.get()) globalState$.isFullscreen.set(false);
    // if (globalState$.firstLaunch.get()) {
    //   navigation.navigate({
    //     to: "/first-launch",
    //   });
    // }
    if (globalState$.appId.get() === null) {
      globalState$.appId.set(v4());
    }
  }, []);

  return (
    <AnimatePresence>
      <Tabs.Root
        defaultValue="collections"
        className=" bg-neutral-100 dark:bg-neutral-950 flex flex-col w-full h-screen p-2 space-y-2"
      >
        <motion.div
          className="w-full flex items-center justify-between"
          initial={{ height: "0%", display: "none" }}
          onMouseOver={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
          animate={{
            height: showTop ? "3%" : "0%",
            display: showTop ? "flex" : "none",
          }}
        >
          <div className="flex items-center justify-start space-x-4">
            <div className="flex items-center justify-start space-x-3">
              <img src={icon} alt="icon" className="w-5 h-5" />
              <div className="flex items-center justify-center space-x-2">
                <Button
                  disabled={!!isHome}
                  onClick={() => navigation.history.back()}
                  className="bg-white dark:bg-neutral-800 rounded-md p-1 text-black dark:text-neutral-300 disabled:text-neutral-400 disabled:bg-transparent"
                >
                  <ArrowLeft size={13} weight="Linear" />
                </Button>
                <Button
                  onClick={() => navigation.history.forward()}
                  className="bg-white dark:bg-neutral-800 dark:text-neutral-300 rounded-md p-1"
                >
                  <ArrowRight size={13} weight="Linear" />
                </Button>
              </div>
            </div>
            <Tabs.List className="flex items-center justify-start space-x-2">
              <Tabs.Tab className="tabTrigger" value="issues">
                <Book size={13} />
                <span>Issues</span>
              </Tabs.Tab>
              <Tabs.Tab className="tabTrigger" value="collections">
                <Library size={13} />
                <span>Collections</span>
              </Tabs.Tab>
            </Tabs.List>
            <Button onClick={() => addIssue()} className="text-black">
              <AddSquare weight="Linear" size={17} />
            </Button>
          </div>
          <div className="flex items-center justify-end space-x-3 text-neutral-500">
            <ThemeButton />
            <Link to="/settings">
              <Settings weight="Bold" size={15} />
            </Link>
            <Button onClick={() => minimize()}>
              <MinusSquare weight="Bold" size={15} />
            </Button>
            <Button onClick={() => maximize()}>
              <MaximizeSquare3 weight="Bold" size={15} />
            </Button>
            <Button className="text-red-800" onClick={() => close()}>
              <CloseCircle weight="Bold" size={15} />
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="bg-white dark:bg-neutral-900 dark:text-neutral-200 w-full rounded-md corner-superellipse/2 overflow-hidden"
          initial={{
            height: "100%",
          }}
          animate={{ height: showTop ? "97%" : "100%" }}
        >
          {children}
        </motion.div>
      </Tabs.Root>
    </AnimatePresence>
  );
}
