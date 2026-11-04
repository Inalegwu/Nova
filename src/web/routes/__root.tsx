import { SolarProvider } from '@solar-icons/react';
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Layout } from '../components';

export const Route = createRootRoute({
  component: () => {
    const routerState = useRouterState();

    const isFirstLaunch = routerState.location.href === '/first-launch';

    console.log({ isFirstLaunch });

    // hide the app layout on the first launch screen only
    if (isFirstLaunch) {
      return (
        <SolarProvider
          value={{
            size: 18,
            weight: 'Bold',
          }}
        >
          <Outlet />
        </SolarProvider>
      );
    }

    return (
      <SolarProvider
        value={{
          size: 18,
          weight: 'Bold',
        }}
      >
        <Layout>
          <Outlet />
          <Toaster richColors position='bottom-center' />
          {/* <TanStackRouterDevtools /> */}
        </Layout>
      </SolarProvider>
    );
  },
});
