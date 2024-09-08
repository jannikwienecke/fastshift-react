'use client';

import { ViewConfigType } from '@apps-next/core';
import { QueryProviderAnother } from '@apps-next/react';
import { DehydratedState, HydrationBoundary } from '@tanstack/react-query';

export const ClientViewProvider = ({
  viewConfig,
  queryClientState,
  children,
}: {
  viewConfig: ViewConfigType;
  children: React.ReactNode;
  queryClientState: DehydratedState;
}) => {
  return (
    <HydrationBoundary state={queryClientState}>
      <QueryProviderAnother viewConfig={viewConfig} includeConfig={{}}>
        {children}
      </QueryProviderAnother>
    </HydrationBoundary>
  );
};
