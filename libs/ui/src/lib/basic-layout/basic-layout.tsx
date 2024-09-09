'use client';

import { RegisteredViews, ViewConfigType } from '@apps-next/core';
import { Icon } from '../icon';

export const BasicLayout = ({
  children,
  views,
  currentPath,
  Link,
}: {
  children: React.ReactNode;
  views: RegisteredViews;
  currentPath: string;
  Link: (props: {
    href: string;
    children: React.ReactNode;
    className: string;
  }) => React.ReactNode;
}) => {
  return (
    <div className="flex flex-row pt-2 ">
      <div className="min-w-[12rem]">
        <div className="flex flex-col gap-2 p-4 text-[14px]">
          {Object.values(views).map((view) => {
            const href = `/fastapp/${view?.relativePath || view?.viewName}`;
            const isActive = currentPath === href;
            if (!view) return null;

            return (
              <Link
                className={`flex items-center gap-2 ${
                  isActive ? 'font-bold' : ''
                }`}
                key={view?.viewName}
                href={href}
              >
                <div>
                  <Icon icon={view?.icon ?? 'FaDotCircle'} />
                </div>

                <div>{view?.viewName}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="grow">{children}</main>
    </div>
  );
};
