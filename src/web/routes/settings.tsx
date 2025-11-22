import { Flex } from "@kuma-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import React, { memo } from "react";

export const Route = createFileRoute("/settings")({
  component: memo(Component),
});

function Component() {
  return <Flex> under construction</Flex>;
}
