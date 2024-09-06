import {
  ApiClientType,
  BaseConfigInterface,
  registeredViewsServerAtom,
  registeredViewsServerStore,
} from '@apps-next/core';
// import { PrismaQueryProvider } from '../../../query-adapter/src/lib/prisma-query-provider';

export const PrismaQueryProviderServer = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  api: ApiClientType;
  config: BaseConfigInterface;
}) => {
  const registered = registeredViewsServerStore.get(registeredViewsServerAtom);

  return (
    // <PrismaQueryProvider {...props} registeredViews={registered}>
    <>{children}</>
    // </PrismaQueryProvider>
  );
};
