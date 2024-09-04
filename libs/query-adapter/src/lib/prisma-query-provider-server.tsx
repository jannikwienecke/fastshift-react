import {
  BaseConfigInterface,
  registeredViewsServerAtom,
  registeredViewsServerStore,
} from '@apps-next/core';
import { PrismaQueryProvider } from './prisma-query-provider';
import { PrismaClientType } from './prisma.client.types';

export const PrismaQueryProviderServer = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  api: PrismaClientType;
  config: BaseConfigInterface;
}) => {
  const registered = registeredViewsServerStore.get(registeredViewsServerAtom);

  return (
    <PrismaQueryProvider {...props} registeredViews={registered}>
      {children}
    </PrismaQueryProvider>
  );
};
