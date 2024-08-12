import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="p-2">
      <div className="flex gap-2 text-lg border-b">
        <Link
          to={'/'}
          activeProps={{
            className: 'font-bold',
          }}
        >
          Home
        </Link>
      </div>

      <hr />

      <Outlet />
      {/* Start rendering router matches */}
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
