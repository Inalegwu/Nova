import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Layout } from "../components";
import { SolarProvider } from "@solar-icons/react";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => (
    <SolarProvider
      value={{
        size: 13,
        weight: "Bold",
        color: "navy",
      }}
    >
      <Layout>
        <Outlet />
        <Toaster />
        {/* <TanStackRouterDevtools /> */}
      </Layout>
    </SolarProvider>
  ),
});
