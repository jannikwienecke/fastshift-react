import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp')({
  component: FastAppLayoutComponent,
});

function FastAppLayoutComponent() {
  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[15rem]">
        {/* <Link to="/fastApp/projects">Projects</Link> */}
        <div>
          {' '}
          <Link to="/fastApp/tasks">Tasks</Link>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
