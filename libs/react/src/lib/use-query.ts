import { useConvexQuery } from '@apps-next/convex-adapter-app';
import { useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom } from './ui-components/query-input';
import { useViewConfig } from './use-view-config';

import {
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { usePrismaQuery } from '@apps-next/query-adapter';

const useQueryDict: Record<'prisma' | 'convex', typeof useConvexQuery> = {
  convex: useConvexQuery,
  prisma: usePrismaQuery,
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps: QueryProps
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const { viewConfigManager } = useViewConfig();
  const query = useAtomValue(debouncedQueryAtom);

  const _useQuery = useQueryDict[viewConfigManager.getDbProvider()];

  const resturnData = _useQuery<QueryReturnType>({
    queryProps: {
      ...queryProps,
      query: queryProps.query ?? query,
      viewConfigManager: queryProps.viewConfigManager ?? viewConfigManager,
    },
    globalConfig: {},
  });

  React.useEffect(() => {
    if (resturnData.error) {
      console.log('Use Query Error: ', resturnData.error);
      alert(String(resturnData.error));
    }
  }, [resturnData.isError]);

  return resturnData;
};
