import {
  ConvexSchemaType,
  ConvexViewManager,
} from '@apps-next/convex-adapter-app';
import { DataProvider } from '@apps-next/core';
import { ViewDataProvider } from './view-provider';

export const generateConfigFrom = <
  TDataProvider extends DataProvider,
  TDataModel extends ConvexSchemaType
>(
  provider: TDataProvider,
  schema: TDataProvider extends 'convex' ? TDataModel : never
) => {
  if (provider === 'convex') {
    return new ConvexViewManager<TDataModel>(schema, ViewDataProvider);
  } else {
    throw new Error('Provider not supported yet');
  }
};
