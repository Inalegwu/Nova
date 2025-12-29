import { ContextMenu } from "@base-ui/react/context-menu";
import { useRouter } from "@tanstack/react-router";
import { AddSquare, Pen, TrashBinMinimalistic } from "@solar-icons/react";
import t from "@/shared/config";

export default function IssueBox(issue: Partial<Issue>) {
  const nav = useRouter();
  const utils = t.useUtils();

  const { mutate: deleteIssue } = t.issue.deleteIssue.useMutation({
    onSuccess: () => utils.library.getLibrary.invalidate(),
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        onClick={() =>
          nav.navigate({
            href: "/read/$issueId",
            params: {
              // @ts-ignore
              issueId: issue.id,
            },
          })
        }
        className="w-50 h-75 mb-16 cursor-pointer"
      >
        <img
          src={issue.thumbnailUrl}
          className="w-full h-full bg-zinc-200/5 dark:opacity-[0.8] rounded-md border border-solid border-neutral-200 dark:border-zinc-600"
          alt={`thumb_${issue.id}`}
        />
        <span className="text-xs text-black dark:text-neutral-400 font-medium w-full">
          {issue.issueTitle?.slice(0, issue.issueTitle?.length / 2)}
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Portal className="outline-none">
        <ContextMenu.Positioner className="origin-(--transform-origin) rounded-md corner-superellipse/2 bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-200 shadow-lg shadow-gray-200 outline outline-gray-200 transition-opacity data-ending-style:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
          <ContextMenu.Popup className="flex flex-col items-start justify-center space-y-1 p-1">
            <div className="flex w-full items-center justify-start gap-2">
              <ContextMenu.Item
                onClick={() =>
                  deleteIssue({
                    issueId: issue.id!,
                  })
                }
                className="ctxMenuRowItem text-red-500 hover:bg-red-500/10"
              >
                <TrashBinMinimalistic size={14} />
              </ContextMenu.Item>
              <ContextMenu.Item className="ctxMenuRowItem">
                <AddSquare size={14} />
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() =>
                  nav.navigate({
                    to: "/edit/$issue",
                    params: {
                      issue: issue.id || "",
                    },
                  })
                }
                className="ctxMenuRowItem"
              >
                <Pen size={14} />
              </ContextMenu.Item>
            </div>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
