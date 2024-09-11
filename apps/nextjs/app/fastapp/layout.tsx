import { getViews } from '@apps-next/react';
import { FastAppLayout } from './fast-app-layout';

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FastAppLayout views={getViews()}>{children}</FastAppLayout>;
}
