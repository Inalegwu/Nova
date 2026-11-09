import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Layout } from '../components';
import ErrorComponent from '../components/error';

export const Route = createRootRoute({
  component: () => {
    const routerState = useRouterState();

    const isFirstLaunch = routerState.location.href === '/first-launch';

    console.log({ isFirstLaunch });

    // hide the app layout on the first launch screen only
    if (isFirstLaunch) {
      return <Outlet />;
    }

    return (
      <Layout>
        <Outlet />
        <Toaster richColors position='bottom-center' />
      </Layout>
    );
  },
  errorComponent: (props) => <ErrorComponent {...props} />,
});
