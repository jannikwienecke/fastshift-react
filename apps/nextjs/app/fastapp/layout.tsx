import Link from 'next/link';
// import { viewConfig as ProjectsViewConfig } from './projects/projects.config';
// import { viewConfig as TasksViewConfig } from './tasks/tasks.config';
// import { viewConfig as CategoriesViewConfig } from './categories/categories.config';

// console.debug('Registered Views');
// console.debug(TasksViewConfig.viewName);
// console.debug(ProjectsViewConfig.viewName);
// console.debug(CategoriesViewConfig.viewName);
// console.debug('==');
// console.debug(' ');

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[15rem]">
        <div className="flex flex-col gap-2 p-4">
          <Link href="/fastapp/tasks">Tasks</Link>
          <Link href="/fastapp/projects">Projects</Link>
          <Link href="/fastapp/categories">Categories</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
