'use client';

import { getViewFieldsConfig } from '@apps-next/core';
import { ClientViewProvider, QueryProviderProps } from '@apps-next/react';
import { queryClient } from '../query-client';

export const ViewProvider = (props: QueryProviderProps) => {
  return (
    <ClientViewProvider
      {...props}
      viewFieldsConfig={getViewFieldsConfig()}
      queryClient={queryClient}
    />
  );
};
