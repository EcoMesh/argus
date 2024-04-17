import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import { DashboardLayout, DashboardMapLayout } from 'src/layouts/dashboard';


export const IndexPage = lazy(() => import('src/pages/app'));
export const MapPage = lazy(() => import('src/pages/map'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const SignupPage = lazy(() => import('src/pages/signup'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const SensorsPage = lazy(() => import('src/pages/sensors'));
export const SensorInitPage = lazy(() => import('src/pages/sensor-init'));
export const AlarmsPage = lazy(() => import('src/pages/alarms'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'users', element: <UserPage /> },
        { path: 'alarms', element: <AlarmsPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'sensors', element: <SensorsPage /> },
      ],
    },
    {
      element: (
        <DashboardMapLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardMapLayout>
      ),
      children: [{ path: 'map', element: <MapPage /> }],
    },
    {
      path: 'init',
      element: <SensorInitPage />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'signup',
      element: <SignupPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
