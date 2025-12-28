import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { globalState$ } from "../state";

export default function ErrorComponent(props: ErrorComponentProps) {
  useEffect(() => {
    // TODO: aptabase for error reporting
    console.error({ error: props.error, instanceId: globalState$.appId.get() });
  }, [props]);

  return (
    <div className="w-full h-screen bg-neutral-100 flex flex-col items-start justify-center">
      <h3>Something went wrong</h3>
      <p>{props.error.message}</p>
      <code className="bg-white rounded-md corner-superellipse/2">
        {props.error.stack}
      </code>
    </div>
  );
}
