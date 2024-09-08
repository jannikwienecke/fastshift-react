'use client';

import { RegisteredViews } from '@apps-next/core';
import { Icon } from '@apps-next/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const FastAppLayout = ({
  children,
  views,
}: {
  children: React.ReactNode;
  views: RegisteredViews;
}) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-row pt-2 ">
      <div className="min-w-[12rem]">
        <div className="flex flex-col gap-2 p-4 text-[14px]">
          {Object.values(views).map((view) => {
            const href = `/fastapp/${view?.relativePath || view?.viewName}`;
            const isActive = pathname === href;
            return (
              <Link
                key={view?.viewName}
                href={href}
                className={`flex items-center gap-2 ${
                  isActive ? 'font-bold' : ''
                }`}
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
