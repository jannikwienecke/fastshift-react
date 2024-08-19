import {
  GlobalConfig,
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

  const data = useQuery({
    queryKey: [`view-loader`, viewName, queryProps.query ?? ''],
    queryFn: async () =>
      prisma.viewLoader({
        ...queryProps,
        viewConfig: queryProps.viewConfigManager?.viewConfig,

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        viewConfigManager: undefined,
      }),
  });

  return data;
};
