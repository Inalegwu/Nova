import { createFileRoute } from "@tanstack/react-router";
import * as Array from "effect/Array";
import React, { Suspense } from "react";
import { readingState$ } from "../state";

export const Route = createFileRoute("/history")({
  component: Index,
});

function Index() {
  return <div>under construction</div>;
}
