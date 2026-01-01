import t from "@/shared/config";
import { Checkbox } from "@base-ui/react/checkbox";
import { Dialog } from "@base-ui/react/dialog";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { AddSquare, CheckCircle } from "@solar-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/$collectionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  const [toAdd,setToAdd]=useState<Array<string>>([]);

  const {data}=t.library.getCollectionById.useQuery({collectionId},{});

  const {data:unmatched,isLoading:gettingUnmatched}=t.library.getLibrary.useQuery();

  console.log({toAdd});

  return <div className="w-full h-full p-2 flex flex-col items-start justify-start space-y-2">
    {/* TODO: fill in collection metadata from comic vine */}
    <div className="flex items-center justify-start gap-5">
      <img src={data?.issues?.at(0)?.thumbnailUrl} alt={`cover__${data?.collection?.id}`} className="w-lg h-90 border border-solid border-neutral-200 dark:border-neutral-800 rounded-lg corner-superellipse/1.3"/>
    <div className="flex flex-col items-start justify-start gap-2">
        <p className="text-2xl font-bold">{data?.collection?.collectionName}</p>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto asperiores eum ut veritatis adipisci ipsum nostrum obcaecati fuga corporis deleniti maiores, recusandae at atque nam porro placeat provident deserunt saepe.</p>
   <div className="flex items-center justify-start gap-2">
   <Dialog.Root>
    <Dialog.Trigger>
       <button className="my-2 text-neutral-900 dark:text-neutral-300">
      <AddSquare size={25}/>
    </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
      <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-xl max-w-[calc(100vw-1rem)] max-h-90 overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-50 dark:bg-neutral-950 p-6 text-neutral-900 dark:text-neutral-200 outline outline-gray-200 transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:outline-gray-300">
        <Dialog.Title className="font-bold text-lg">Add Issue To Collection</Dialog.Title>
          <ScrollArea.Root className="h-42 w-full max-w-[calc(100vw-8rem)] my-3">
            <ScrollArea.Viewport className="h-full overscroll-contain rounded-md outline bg-neutral-100 dark:bg-neutral-900 p-1 gap-2 -outline-offset-1 outline-gray-200 focus-visible:outline focus-visible:outline-blue-800">
              {unmatched?.issues?.map((issue)=>(
              <div key={issue.id} className="flex items-center justify-between py-1 px-2">
                <p className="text-sm text-neutral-800 dark:text-neutral-200">{issue.issueTitle}</p>
                 <Checkbox.Root
        onCheckedChange={(checked)=>checked?setToAdd((old)=>([...old,issue.id])):setToAdd((old)=>([...old.filter(v=>v!==issue.id)]))}
        className="flex size-5 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-checked:bg-neutral-900 data-unchecked:border data-unchecked:border-neutral-200 data-unchecked:dark:border-neutral-800"
      >
        <Checkbox.Indicator className="flex text-gray-50 dark:text-neutral-200 data-unchecked:hidden">
          <CheckCircle className="size-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
              </div>
            ))}
            </ScrollArea.Viewport>
          </ScrollArea.Root>
      </Dialog.Popup>
    </Dialog.Portal>
   </Dialog.Root>
   </div>
    </div>
     </div>
    <div className="flex flex-col items-start justify-start">
      {data?.issues?.map((issue,idx)=>(
        <Link to="/read/$issueId" params={{issueId:issue.id}} className="w-full items-center justify-between">
         <div className="flex items-center justify-start gap-1">
           <p>{idx +1}</p>
          <p>{issue.issueTitle}</p>
         </div>
        </Link>
      ))}
    </div>
  </div>;
}
