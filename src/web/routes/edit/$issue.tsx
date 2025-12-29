import t from "@/shared/config";
import { Tag } from "@/web/components";
import { Button } from "@base-ui/react/button";
import { CloudCheck, CloudDownload } from "@solar-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

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
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold">
            {issue?.issue.issueTitle.replace(/\s*\([^)]*\)/, "")}
          </span>
          {isOnline && <Button className="squiricle flex items-center justify-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-2">
            <CloudDownload weight="BoldDuotone" size={18} />
          </Button>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-400 p-3 bg-neutral-50 space-y-2 rounded-xl squiricle">
            {issue?.metadata?.Summary}
          </span>
          <div className="flex items-center justify-start gap-3">
            {issue?.metadata?.Summary?.includes("NSFW") && <Tag type="nsfw" />}
          </div>
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
              <CloudCheck weight="Bold" size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
