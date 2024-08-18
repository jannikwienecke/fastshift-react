'use client';

import { ViewProvider } from 'libs/react/src/lib/view-provider';

export const createClientView = <TGlobal extends Record<string, any>>(
  globalConfig: TGlobal
) => {
  return (
    <ViewProvider view={{} as any}>
      <>HELLOF FROM CLIENT</>
    </ViewProvider>
  );
};
