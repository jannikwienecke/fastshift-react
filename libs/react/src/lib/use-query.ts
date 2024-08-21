import { useConvexQuery } from '@apps-next/convex-adapter-app';
import { useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom } from './ui-components/query-input';
import { useView } from './use-view';

import {
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { usePrismaQuery } from '@apps-next/query-adapter';
import { useGlobalConfig } from './use-global-config';

const useQueryDict: Record<'prisma' | 'convex', typeof useConvexQuery> = {
  convex: useConvexQuery,
  prisma: usePrismaQuery,
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: QueryProps
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const { viewConfigManager, registeredViews } = useView();
  const query = useAtomValue(debouncedQueryAtom);
  const globalConfig = useGlobalConfig();

  const _useQuery = useQueryDict[globalConfig?.provider];

  const resturnData = _useQuery<QueryReturnType>({
    queryProps: {
      ...queryProps,
      registeredViews,
      modelConfig: viewConfigManager.modelConfig,
      query: queryProps?.query ?? query,
      viewConfigManager: queryProps?.viewConfigManager ?? viewConfigManager,
    },
    globalConfig,
  });

  React.useEffect(() => {
    if (resturnData.error) {
      console.error('Use Query Error: ', resturnData.error);
    }
  }, [resturnData.error]);

  return resturnData;
};
