import {
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useConvexQuery } from './convex-query-provider';

const useQueryDict = {
  convex: useConvexQuery,
  // prisma: null,
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps: QueryProps
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const useQuery = useQueryDict['convex'];

  return useQuery<QueryReturnType>({
    queryProps,
    globalConfig: {},
  });
};
