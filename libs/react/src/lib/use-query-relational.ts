import { useView } from './use-view';

import { QueryReturnOrUndefined, RecordRelationType } from '@apps-next/core';
import { usePrismaQueryRelational } from '@apps-next/query-adapter';
import { useGlobalConfig } from './use-global-config';

const useQueryRelationalDict: Record<
  'prisma' | 'convex',
  typeof usePrismaQueryRelational
> = {
  convex: usePrismaQueryRelational,
  prisma: usePrismaQueryRelational,
};

export const useRelationalQuery = ({
  tableName,
  query,
}: {
  tableName: string;
  query?: string;
}): QueryReturnOrUndefined<RecordRelationType> => {
  const { viewConfigManager, registeredViews } = useView();
  const globalConfig = useGlobalConfig();

  const useQueryRelational = useQueryRelationalDict[globalConfig?.provider];

  return useQueryRelational({
    globalConfig,
    queryProps: {
      query: query,

      registeredViews: registeredViews,
      modelConfig: viewConfigManager?.modelConfig,
      relationQuery: {
        tableName: tableName,
      },
      viewConfigManager: viewConfigManager,
    },
  });
};
