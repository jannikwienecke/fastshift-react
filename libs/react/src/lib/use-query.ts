import { useConvexQuery } from '@apps-next/convex-adapter-app';
import {
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';

const useQueryDict = {
  convex: useConvexQuery,
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
