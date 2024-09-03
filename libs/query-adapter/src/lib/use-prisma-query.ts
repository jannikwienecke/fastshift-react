import {
  makeQueryKey,
  QueryProps,
  QueryReturnDto,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { usePrismaApi } from './use-prisma-api';

export const useStableQuery = (
  fn: () => Promise<QueryReturnDto>,
  args: QueryProps
) => {
  const result = useQuery({
    queryKey: makeQueryKey({
      viewName: args.viewConfigManager?.getViewName(),
      query: args.query,
      relation: args.relationQuery?.tableName,
    }),
    queryFn: fn,
    enabled: args.disabled === true ? false : true,
  });

  const stored = React.useRef(result as any);

  if (result.data !== undefined) {
    stored.current = result;
  } else {
    stored.current = {
      ...result,
      data: stored.current?.data,
    };
  }

  return stored.current;
};

export const usePrismaQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = usePrismaApi();

  const queryReturn = useStableQuery(async () => {
    const res = await prisma.viewLoader({
      ...queryProps,
      registeredViews: queryProps?.registeredViews ?? {},
      modelConfig: queryProps?.viewConfigManager?.modelConfig,
      query: queryProps?.query,

      viewConfig: queryProps?.viewConfigManager?.viewConfig,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    });

    return res;
  }, (queryProps ?? {}) as QueryProps);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
    relationalData: queryReturn.data?.relationalData,
  };
};
