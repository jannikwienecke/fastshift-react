import {
  BaseConfigInterface,
  registeredViewsAtom,
  registeredViewsStore,
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
  // TODO: Currently these are just the server side rendered views
  // we need to collect the one from the client as well
  // and other way around with the client configs
  const registered = registeredViewsStore.get(registeredViewsAtom);

  console.log('==registered', registered);
  return (
    <PrismaQueryProvider {...props} registeredViews={registered}>
      {children}
    </PrismaQueryProvider>
  );
};
