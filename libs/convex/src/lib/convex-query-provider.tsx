import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexQueryProviderProps } from './types.convex';
import { ConvexContextProvider } from './convex-context';

export const ConvexQueryProvider = (props: ConvexQueryProviderProps) => {
  const convex = new ConvexReactClient(props.convexUrl);

  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  return (
    <ConvexContextProvider api={props.api}>
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </ConvexProvider>
    </ConvexContextProvider>
  );
};
