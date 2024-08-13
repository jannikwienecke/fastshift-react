import { ViewConfig } from '@apps-next/core';
import React from 'react';

type PageContextType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewConfig: ViewConfig<any>;
  //   data: RecordType[] | undefined;
};

export const ViewContext = React.createContext<PageContextType>(
  {} as PageContextType
);
