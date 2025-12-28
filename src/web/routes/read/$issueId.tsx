import t from "@/shared/config";
import { Spinner } from "@/web/components";
import { useTimeout } from "@/web/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/read/$issueId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();

  const [isEnabled, setIsEnabled] = useState(false);

  const { data: pages, isLoading: fetchingPages } = t.issue.getPages.useQuery(
    {
      issueId,
    },
    {
      enabled: isEnabled,
    },
  );

  useTimeout(() => setIsEnabled(true), 500);

  if (fetchingPages) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="border-4" size={50} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute z-10 top-2 right-2 bg-neutral-100 dark:bg-neutral-900 rounded-md corner-superellipse/2">
        toolbar
      </div>
    </div>
  );
}
