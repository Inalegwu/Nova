import { createFileRoute } from "@tanstack/react-router";
import * as Array from "effect/Array";
import React, { Suspense } from "react";
import { LoadingSkeleton } from "../components";
import { readingState$ } from "../state";
import { Flex } from "@kuma-ui/core";

const CurrentlyReading = React.lazy(
  () => import("../components/currently-reading"),
);
const DoneReading = React.lazy(() => import("../components/done-reading"));

export const Route = createFileRoute("/history")({
  component: Index,
});

function Index() {
  return <Flex>under construction</Flex>;
}
