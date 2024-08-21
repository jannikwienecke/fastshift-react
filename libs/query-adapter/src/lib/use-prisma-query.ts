import {
  GlobalConfig,
  QUERY_KEY_PREFIX,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useQuery } from '@tanstack/react-query';
import { usePrismaApi } from './use-prisma-api';

export const usePrismaQuery = <QueryReturnType extends RecordType[]>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = usePrismaApi();

  const viewName = queryProps.viewConfigManager?.getViewName();

  const queryReturn = useQuery({
    queryKey: [QUERY_KEY_PREFIX, viewName, queryProps.query ?? ''],
    queryFn: async () => {
      const res = await prisma.viewLoader({
        ...queryProps,

        viewConfig: queryProps.viewConfigManager?.viewConfig,
        modelConfig: queryProps.viewConfigManager?.modelConfig,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        viewConfigManager: undefined,
      });

      return res;
    },
  });

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
  };
};
