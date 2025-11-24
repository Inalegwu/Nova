import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { globalState$ } from "../state";

export default function ErrorComponent(props: ErrorComponentProps) {
  useEffect(() => {
    // TODO: aptabase for error reporting
    console.error({ error: props.error, instanceId: globalState$.appId.get() });
  }, [props]);

  return <div>error page</div>;
}
