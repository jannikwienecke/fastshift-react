import {
  GlobalConfig,
  QUERY_KEY_PREFIX,
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
    queryKey: [
      QUERY_KEY_PREFIX,
      args.viewConfigManager?.getViewName(),
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

export const usePrismaQuery = <QueryReturnType extends RecordType[]>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = usePrismaApi();

  const queryReturn = useStableQuery(async () => {
    const res = await prisma.viewLoader({
      ...queryProps,

      viewConfig: queryProps.viewConfigManager?.viewConfig,
      modelConfig: queryProps.viewConfigManager?.modelConfig,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    });

    return res;
  }, queryProps);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
    relationalData: queryReturn.data?.relationalData,
  };
};
