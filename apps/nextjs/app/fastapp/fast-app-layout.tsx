'use client';

import { projectsConfig } from '@apps-next/convex';
import { RegisteredViews } from '@apps-next/core';
import { BasicLayout } from '@apps-next/ui';
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
    <BasicLayout
      views={views}
      currentPath={pathname}
      Link={(props) => <Link {...props} prefetch={true} />}
    >
      {children}
    </BasicLayout>
  );
};
