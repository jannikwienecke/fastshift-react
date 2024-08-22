import Link from 'next/link';
import { viewConfig as ProjectsViewConfig } from './projects/page';
import { viewConfig as TasksViewConfig } from './tasks/page';

console.debug('Registered Views');
console.debug(TasksViewConfig.viewName);
console.debug(ProjectsViewConfig.viewName);
console.debug('==');
console.debug(' ');

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[15rem]">
        <div className="flex flex-col gap-2">
          <Link href="/fastapp/tasks">Tasks</Link>
          <Link href="/fastapp/projects">Projects</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
