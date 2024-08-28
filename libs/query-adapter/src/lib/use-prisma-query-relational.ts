import {
  GlobalConfig,
  QueryProps,
  QueryReturnDto,
  QueryReturnOrUndefined,
  RecordRelationType,
  RecordType,
  RELATIONAL_QUERY_KEY_PREFIX,
} from '@apps-next/core';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { usePrismaApi } from './use-prisma-api';

const useStableQuery = (
  fn: () => Promise<QueryReturnDto>,
  args: QueryProps
) => {
  const result = useQuery({
    queryKey: [
      RELATIONAL_QUERY_KEY_PREFIX,
      args.relationQuery?.tableName,
      args.query ?? '',
    ],
    queryFn: fn,
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

export const usePrismaQueryRelational = <
  QueryReturnType extends RecordRelationType[]
>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = usePrismaApi();

  const queryReturn = useStableQuery(async () => {
    if (!queryProps.relationQuery?.tableName)
      throw new Error('tableName is required');

    const res = await prisma.viewLoader({
      query: queryProps.query,
      registeredViews: queryProps.registeredViews,
      modelConfig: queryProps.viewConfigManager?.modelConfig,
      relationQuery: queryProps.relationQuery,
      viewConfig: queryProps.viewConfigManager?.viewConfig,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    });

    return res;
  }, queryProps);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
  };
};
