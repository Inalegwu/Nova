import { useObservable } from "@legendapp/state/react";
import t from "@/shared/config";
import { createFileRoute } from "@tanstack/react-router";
import React, { memo } from "react";
import { toast } from "sonner";
import { useTimeout } from "../hooks";
import { globalState$ } from "../state";
import { Tabs } from "@base-ui/react/tabs";

export const Route = createFileRoute("/")({
  component: memo(Component),
});

function Component() {
  const isEnabled = useObservable(false);

  const collectionName = useObservable("");
  const utils = t.useUtils();

  const view = globalState$.libraryView.get();

  const { data } = t.library.getLibrary.useQuery(undefined, {
    enabled: isEnabled.get(),
    onError: (error) => toast.error(error.message),
  });

  const { mutate: createCollection, isPending: creating } =
    t.library.createCollection.useMutation({
      onSuccess: (data) => utils.library.invalidate(),
      onError: (error) => toast.error(error.message),
    });

  useTimeout(() => isEnabled.set(true), 500);

  console.log({ data });

  return (
    <div className="w-full h-full">
      <Tabs.Panel value="collections">collections</Tabs.Panel>
      <Tabs.Panel value="issues">issues</Tabs.Panel>
    </div>
  );
}
