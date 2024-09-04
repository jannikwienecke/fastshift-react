'use client';

import {
  registeredViewsAtom,
  registeredViewsServerAtom,
} from '@apps-next/core';
import { Icon } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import Link from 'next/link';

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const registeredViewsClient = useAtomValue(registeredViewsAtom);
  const registeredViewsServer = useAtomValue(registeredViewsServerAtom);

  const registeredViews = {
    ...registeredViewsServer,
    ...registeredViewsClient,
  };

  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[12rem]">
        <div className="flex flex-col gap-2 p-4 text-[14px]">
          {Object.values(registeredViews).map((view) => (
            <Link
              key={view?.viewName}
              href={`/fastapp/${view?.relativePath || view?.viewName}`}
              className="flex items-center gap-2"
            >
              <div>
                <Icon icon={view?.icon ?? 'FaDotCircle'} />
              </div>
              <div>{view?.viewName}</div>
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
