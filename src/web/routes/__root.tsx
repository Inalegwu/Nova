import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Layout } from '../components';
import { SolarProvider } from '@solar-icons/react';
import { Toaster } from 'sonner';

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
