import { createFileRoute } from '@tanstack/react-router';
import * as Array from 'effect/Array';
import React, { Suspense } from 'react';

export const Route = createFileRoute('/history')({
  component: Index,
});

function Index() {
  return <div className="w-full h-full font-medium">
    <h1 className="text-2xl font-bold">under construction</h1>
  </div>;
}
