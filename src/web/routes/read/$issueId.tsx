import t from "@/shared/config";
import { Spinner } from "@/web/components";
import { useKeyPress, useTimeout } from "@/web/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMotionValue, motion } from "motion/react";
import { Toolbar } from "@base-ui/react/toolbar";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  AltArrowLeft,
  AltArrowRight,
  AltArrowUp,
  AltArrowDown,
  ArrowLeft,
  Maximize,
} from "@solar-icons/react";

const DRAG_BUFFER = 50;

export const Route = createFileRoute("/read/$issueId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();
  const nav = useRouter();

  const [isEnabled, setIsEnabled] = useState(false);

  const { data, isLoading: fetchingPages } = t.issue.getPages.useQuery(
    {
      issueId,
    },
    {
      enabled: isEnabled,
    },
  );

  useTimeout(() => setIsEnabled(true), 500);

  const contentLength = data?.pages.length || 0;
  const [itemIndex, setItemIndex] = useState(0);
  const dragX = useMotionValue(0);
  const width = useMemo(
    () => Math.floor((itemIndex / contentLength) * 100),
    [itemIndex, contentLength],
  );

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= DRAG_BUFFER && itemIndex < contentLength) {
      setItemIndex((idx) => idx + 1);
    } else {
      setItemIndex((idx) => idx - 1);
    }
  };

  useKeyPress((e) => {
    if (e.keyCode === 93 && itemIndex < contentLength) {
      setItemIndex((idx) => idx + 1);
    } else if (e.keyCode === 91 && itemIndex > 0) {
      setItemIndex((idx) => idx - 1);
    }
  });

  if (fetchingPages) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="border-4" size={50} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden min-h-screen">
      <motion.div
        className="flex items-center"
        drag="x"
        style={{ x: dragX }}
        animate={{ translateX: `-${itemIndex * 100}%` }}
        transition={{ bounceDamping: 10 }}
        onDragEnd={onDragEnd}
        dragConstraints={{ left: 0, right: 0 }}
      >
        {data?.pages.map((page) => (
          <div
            key={page.id}
            className="w-full h-screen flex items-center justify-center shrink-0"
          >
            <img
              src={page.data}
              alt="page"
              className="aspect-9/16 h-full w-full object-contain"
            />
          </div>
        ))}
      </motion.div>
      {/*TODO:toolbar*/}
      <div className="absolute z-10 p-1 top-0 right-0 flex items-center justify-start space-x-2">
        toolbar
      </div>
      <div className="absolute z-10 bottom-3 left-0 w-full p-2 items-center justify-center">
        <div className="w-full bg-neutral-400/20 backdrop-blur-3xl squiricle">
          <motion.div
            animate={{ width: `${width}%` }}
            className="squiricle bg-white/20 p-2"
          />
        </div>
      </div>
    </div>
  );
}
