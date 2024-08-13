import {} from '@apps-next/convex';
import {
  ConvexApiType,
  ConvexContextType,
  ConvexQueryProviderProps,
} from '@apps-next/convex-adapter';
import {
  GlobalConfig,
  invarant,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { convexQuery, ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';

import React, { useRef } from 'react';

export const parseConvexData = (data?: any[] | null): RecordType[] => {
  return data?.map((r: any) => ({
    id: r._id,
    ...r,
  })) as RecordType[];
};

export const ConvexContext = React.createContext<ConvexContextType>(
  {} as ConvexContextType
);

export const useConvexApi = () => {
  const convexContext = React.useContext(ConvexContext);
  if (!convexContext) {
    throw new Error('ConvexContext not found');
  }

  return convexContext.api;
};

export const ConvexContextProvider = (
  props: React.PropsWithChildren<{ api: ConvexApiType }>
) => {
  return (
    <ConvexContext.Provider value={{ api: props.api }}>
      {props.children}
    </ConvexContext.Provider>
  );
};

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

export const useStableQuery = (fn: any, args: QueryProps) => {
  const result = useQueryTanstack(convexQuery(fn, args));

  const stored = useRef(result);

  if (result.data !== undefined) {
    stored.current = result;
  }

  return stored.current;
};

export const useConvexQuery = <QueryReturnType extends RecordType[]>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const api = useConvexApi();

  invarant(Boolean(api), 'convex api is not defined');

  const data = useStableQuery(api.viewLoader, queryProps);

  const records = parseConvexData(data?.data) as QueryReturnType;

  return {
    isLoading: data.isLoading,
    isError: data.isError,
    data: records,
  };
};
