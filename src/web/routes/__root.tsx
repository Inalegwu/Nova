import { SolarProvider } from '@solar-icons/react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Layout } from '../components';

export const Route = createRootRoute({
  component: () => (
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
  ),
});
