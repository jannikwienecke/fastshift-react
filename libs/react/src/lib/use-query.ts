import { useConvexQuery } from '@apps-next/convex-adapter';
import {
  GlobalConfig,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useViewConfig } from './useViewConfig';

type XX = {
  [key: string]: (props: {
    queryProps: QueryProps;
    globalConfig: GlobalConfig;
  }) => QueryReturnOrUndefined;
};

const useQueryDict = {
  convex: useConvexQuery,
  // prisma: null,
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps: QueryProps
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  // const { viewConfig } = useViewConfig();

  // const useQuery = useQueryDict['convex'];

  return useConvexQuery<QueryReturnType>({
    queryProps,
    globalConfig: {},
  });
};
