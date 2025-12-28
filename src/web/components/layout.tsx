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
  AltArrowDown,
} from "@solar-icons/react";
import { Tabs } from "@base-ui/react/tabs";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@base-ui/react/button";
import { Link } from "./ui/link";
import ThemeButton from "./theme-button";
import { Popover } from "@base-ui/react/popover";
import { Input } from "@base-ui/react/input";

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
  const { mutate: createCollection, isPending: isCreating } =
    t.library.createCollection.useMutation({
      onSuccess: (_) => utils.library.getLibrary.invalidate(),
    });

  // const isNotHome = computed(() => routerState.location.pathname !== "/").get();

  const isHome = routerState.location.pathname === "/";
  const isCollectionView = globalState$.lastOpenedTab.get() === "collections";

  const [showTop, setShowTop] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  const [collectionName, setCollectionName] = useState("");

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
  }, 5000);

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
        defaultValue={globalState$.lastOpenedTab.get()}
        className=" bg-neutral-100 dark:bg-neutral-950 flex flex-col w-full h-screen p-2 space-y-2 root"
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
              <Tabs.Tab
                onClick={() => globalState$.lastOpenedTab.set("issues")}
                className="tabTrigger"
                value="issues"
              >
                <Book size={13} />
                <span>Issues</span>
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => globalState$.lastOpenedTab.set("collections")}
                className="tabTrigger"
                value="collections"
              >
                <Library size={13} />
                <span>Collections</span>
              </Tabs.Tab>
            </Tabs.List>
            <Button
              onClick={() => addIssue()}
              className="bg-white dark:bg-neutral-900 dark:text-neutral-300 rounded-md p-1"
            >
              <AddSquare weight="Bold" size={17} />
            </Button>
            {isCollectionView && (
              <Popover.Root>
                <Popover.Trigger className="bg-white dark:bg-neutral-900 dark:text-neutral-400 rounded-md pl-2 pr-5 py-1 text-xs">
                  Create Collection
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner side="bottom" sideOffset={2}>
                    <Popover.Popup
                      onMouseOver={() => setMouseOver(true)}
                      onMouseLeave={() => setMouseOver(false)}
                      className="origin-(--transform-origin) space-y-1 rounded-lg bg-neutral-100 dark:bg-neutral-950 p-1 text-neutral-900 dark:text-neutral-300 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300"
                    >
                      <Popover.Title className="text-xs font-bold">
                        Create Collection
                      </Popover.Title>
                      <Input
                        disabled={isCreating}
                        placeholder="Collection Name"
                        onChange={(e) =>
                          setCollectionName(e.currentTarget.value)
                        }
                        className="w-full h-7 text-xs px-3 py-1 rounded-md corner-superellipse/2 outline-none bg-white dark:bg-neutral-900 border border-solid border-neutral-200 dark:border-neutral-800"
                      />
                      <Button
                        onClick={() =>
                          createCollection({
                            collectionName,
                          })
                        }
                        className="text-xs text-black dark:text-neutral-300 w-full flex item-center justify-center p-1 rounded-md bg-white corner-superellipse/2 dark:bg-neutral-900"
                      >
                        Create
                      </Button>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            )}
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
