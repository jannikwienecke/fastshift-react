import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp')({
  component: FastAppLayoutComponent,
});

function FastAppLayoutComponent() {
  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[15rem]">
        {/* <Link to="/fastApp/projects">Projects</Link> */}
        <div className="flex flex-col gap-2">
          <Link to="/fastApp/tasks">Tasks</Link>
          <Link to="/fastApp/projects">Projects</Link>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
