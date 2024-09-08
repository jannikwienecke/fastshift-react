'use client';

import { ApiClientType, BaseConfigInterface } from '@apps-next/core';
import { QueryProvider } from '@apps-next/react';

export const Provider = ({
  children,
  api,
  config,
}: {
  children: React.ReactNode;
  api: ApiClientType;
  config: BaseConfigInterface;
}) => {
  return (
    <QueryProvider api={api} config={config}>
      {children}
    </QueryProvider>
  );
};
