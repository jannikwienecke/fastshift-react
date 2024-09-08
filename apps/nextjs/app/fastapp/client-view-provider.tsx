'use client';

import {
  ApiClientType,
  BaseConfigInterface,
  RegisteredViews,
  ViewConfigType,
} from '@apps-next/core';
import { QueryProvider } from '@apps-next/react';

export const ClientViewProvider = (props: {
  viewConfig: ViewConfigType;
  children: React.ReactNode;
  api: ApiClientType;
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
}) => {
  return <QueryProvider {...props} includeConfig={{}} />;
};
