import { getViews } from '@apps-next/core';
import { FastAppLayout } from './fast-app-layout';

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('getViews', getViews());
  return <FastAppLayout views={getViews()}>{children}</FastAppLayout>;
}
