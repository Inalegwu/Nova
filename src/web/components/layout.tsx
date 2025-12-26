import { computed } from "@legendapp/state";
import { useObserveEffect } from "@legendapp/state/react";
import t from "@/shared/config";
import { useRouter, useRouterState } from "@tanstack/react-router";
import type React from "react";
import { useEffect } from "react";
import { v4 } from "uuid";
import { useWindow } from "../hooks";
import { globalState$ } from "../state";
import { toast } from "sonner";
import icon from "@/assets/images/win.png";
import { Flex } from "@radix-ui/themes";
import { X, Minus, Maximize } from "lucide-react";
import { Tabs } from "radix-ui";
import {
  AddSquare,
  File,
  Library,
  List,
  SidebarMinimalistic,
} from "@solar-icons/react";

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

  const isNotHome = computed(() => routerState.location.pathname !== "/").get();
  const isFullscreen = globalState$.isFullscreen.get();

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
      document.body.classList.add("dark");
      globalState$.colorMode.set("dark");
    } else {
      document.body.classList.remove("dark");
      globalState$.colorMode.set("light");
    }
  });

  useWindow("keypress", (e) => {
    if (e.keyCode === 16) {
      console.log("search command pressed");
    }
  });

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
    <Tabs.Root>
      <div className="w-full h-screen bg-neutral-100 p-2 space-y-2">
        <div className="w-full flex items-center justify-between space-x-3">
          <div className="flex items-center justify-start space-x-4">
            <img src={icon} alt="icon" className="w-5 h-5" />
            <button>
              <SidebarMinimalistic weight="BoldDuotone" size={16} />
            </button>
            <button onClick={() => addIssue()}>
              <AddSquare weight="BoldDuotone" size={16} />
            </button>
          </div>
          <Tabs.List
            defaultValue="issues"
            className="flex items-center justify-center space-x-2"
          >
            <Tabs.Trigger className="tabTrigger" value="collections">
              <Library weight="BoldDuotone" size={13} />
              <span>Collections</span>
            </Tabs.Trigger>
            <Tabs.Trigger className="tabTrigger" value="issues">
              <File weight="BoldDuotone" size={13} />
              <span>Issues</span>
            </Tabs.Trigger>
          </Tabs.List>
          <div className="p-3 grow flex" id="drag-region" />
          <div className="flex items-center justify-end space-x-4">
            <button onClick={() => minimize()}>
              <Minus size={14} />
            </button>
            <button onClick={() => maximize()}>
              <Maximize size={14} />
            </button>
            <button onClick={() => close()}>
              <X size={14} />
            </button>
          </div>
        </div>
        <div
          className={`w-full grow ${
            continueReading ? "h-[87.5vh]" : "h-[92vh]"
          } bg-neutral-50 rounded-md corner-superellipse/1 p-2 text-sm font-medium`}
        >
          {children}
        </div>
        {continueReading && (
          <div className="bg-neutral-50 rounded-md corner-superellipse/1 p-1 text-sm font-medium">
            continue reading
          </div>
        )}
      </div>
    </Tabs.Root>
  );
}
