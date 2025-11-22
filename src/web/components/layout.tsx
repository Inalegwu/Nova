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
import { Flex, Text, Link } from "@kuma-ui/core";
import { Button } from "@kuma-ui/core";

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const utils = t.useUtils();
  const navigation = useRouter();
  const routerState = useRouterState();

  const { mutate: minimizeWindow } = t.window.minimize.useMutation();
  const { mutate: maximizeWindow } = t.window.maximize.useMutation();
  const { mutate: closeWindow } = t.window.closeWindow.useMutation();
  const { mutate: launchWatcher } = t.library.launchWatcher.useMutation();

  const isNotHome = computed(() => routerState.location.pathname !== "/").get();
  const isFullscreen = globalState$.isFullscreen.get();

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

  const goToSettings = () =>
    navigation.navigate({
      to: "/settings",
    });

  useWindow("keypress", (e) => {
    if (e.keyCode === 16) {
      console.log("search command pressed");
    }
  });

  useEffect(() => {
    launchWatcher();
    if (globalState$.isFullscreen.get()) globalState$.isFullscreen.set(false);
    if (globalState$.firstLaunch.get()) {
      navigation.navigate({
        to: "/first-launch",
      });
    }
    if (globalState$.appId.get() === null) {
      globalState$.appId.set(v4());
    }
  }, [navigation, launchWatcher]);

  return (
    <Flex
      width="100%"
      bg="colors.light.200"
      className="h-screen transition relative"
    >
      <Text as="h1" fontWeight="bold" fontFamily="Body">
        layout route...under construction
      </Text>
      <Link variant="danger" href="/" color="colors.primary.100">
        content
      </Link>
      <Button variant="danger">content</Button>
    </Flex>
  );
}
