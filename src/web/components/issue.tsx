import { ContextMenu } from "@base-ui/react/context-menu";
import { useRouter } from "@tanstack/react-router";

export default function IssueBox(issue: Partial<Issue>) {
  const nav = useRouter();

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
        <span className="text-xs text-neutral-400 font-medium w-full">
          {issue.issueTitle}
        </span>
      </ContextMenu.Trigger>
      <ContextMenu.Portal className="outline-none">
        <ContextMenu.Positioner className="origin-(--transform-origin) rounded-md corner-superellipse/2 bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-200 shadow-lg shadow-gray-200 outline outline-gray-200 transition-opacity data-ending-style:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
          <ContextMenu.Popup>
            <ContextMenu.Item
              className="flex items-center cursor-pointer rounded-md justify-start space-x-2 px-1 py-1 text-xs text-neutral-900 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              onClick={() =>
                nav.navigate({
                  href: "/edit/$issueId",
                  params: {
                    issueId: issue.id,
                  },
                })
              }
            >
              Edit Issue
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
