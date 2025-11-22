import { useObservable } from "@legendapp/state/react";
import { Flex } from "@kuma-ui/core";
import t from "@/shared/config";
import { createFileRoute } from "@tanstack/react-router";
import React, { memo } from "react";
import { toast } from "@/web/components/toast";
import { useTimeout } from "../hooks";
import { globalState$ } from "../state";

const Collection = React.lazy(() => import("../components/collection"));
const Issue = React.lazy(() => import("../components/issue"));

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

  return <Flex>under construction</Flex>;
}
