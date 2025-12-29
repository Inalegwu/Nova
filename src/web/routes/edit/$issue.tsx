import t from "@/shared/config";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { WiFiRouterMinimalistic } from "@solar-icons/react";

export const Route = createFileRoute("/edit/$issue")({
  component: RouteComponent,
});

function RouteComponent() {
  const { issue: issueId } = Route.useParams();

  const isOnline = useMemo(() => window.navigator.onLine, []);

  const { data: issue } = t.issue.getIssue.useQuery({
    issueId,
  });

  return (
    <div className="flex w-full h-full p-2 gap-2">
      <div className="h-full w-4/6 flex flex-col items-start p-6 justify-center space-y-5">
        <span className="text-2xl font-bold">
          {issue?.issue.issueTitle.replace(/\s*\([^)]*\)/, "")}
        </span>
        <div className="flex flex-col space-y-2">
          <span className="text-lg text-neutral-400">
            {issue?.metadata?.Summary}
          </span>
          {/*{JSON.stringify(issue?.metadata, null, 2)}*/}
        </div>
      </div>
      <div className="h-full w-2/6 flex centered p-4 ">
        <div className="w-full h-full relative overflow-hidden rounded-2xl corner-superellipse/2">
          <img
            src={issue?.issue.thumbnailUrl}
            alt={issue?.issue.issueTitle}
            className="w-full h-full"
          />
          {!isOnline && (
            <div className="absolute z-10 bottom-0 right-0 p-3 bg-neutral-100 text-black dark:bg-neutral-950 dark:text-neutral-300 rounded-tl-2xl corner-tl-bevel">
              <WiFiRouterMinimalistic weight="Bold" size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
