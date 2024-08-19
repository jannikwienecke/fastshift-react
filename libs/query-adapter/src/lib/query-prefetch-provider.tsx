import { QUERY_KEY_PREFIX } from '@apps-next/core';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { PrismaClientType } from './prisma.client.types';

export async function QueryPrefetchProvider({
  children,
  viewName,
  viewLoader,
}: React.PropsWithChildren<{
  viewLoader: PrismaClientType['viewLoader'];
  viewName: string;
}>) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY_PREFIX, viewName, ''],
    queryFn: (context) => viewLoader({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
