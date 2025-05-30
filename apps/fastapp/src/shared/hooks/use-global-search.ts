import { api } from '@apps-next/convex';
import { makeData, Row } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export const useGlobalSearch = () => {
  const query = store$.globalQueryDebounced.get();

  const { data } = useQuery(convexQuery(api.query.globalQuery, { query }));

  React.useEffect(() => {
    const hasResults = Object.keys(data ?? {}).length > 0;
    if (!hasResults) return;

    const parsed = Object.entries(data ?? {}).reduce(
      (acc, [viewName, records]) => {
        if (!records || records.length === 0) return acc;

        const rows = makeData(store$.views.get(), viewName)(records).rows;

        return {
          ...acc,
          [viewName]: rows.length > 0 ? rows : null,
        };
      },
      {} as Record<string, Row[] | null>
    );

    store$.globalQueryData.set(parsed);
  }, [data]);
};
