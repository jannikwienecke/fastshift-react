import {
  ConvexViewManager,
  generateSearchableFieldsFromConvexSchema,
  generateViewFieldsFromConvexSchema,
} from '@apps-next/convex-adapter-app';
import {
  BaseViewConfigManager,
  QueryProps,
  QueryReturnOrUndefined,
  SearchableField,
  ViewFieldConfig,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom } from './ui-components/query-input';
import { useQuery } from './use-query';
import { ViewProvider } from './view-provider';

type Provider = 'convex' | 'prisma';

type ConvexSchemaType = {
  tables: Record<string, any>;
};

const ViewDataProvider = <TProps extends QueryReturnOrUndefined<any>>(props: {
  Component: (props: TProps) => React.ReactNode;
  viewConfig: BaseViewConfigManager;
}) => {
  const _useQuery = (props: QueryProps) => {
    return useQuery<TProps['data']>(props);
  };

  const Content = () => {
    const query = useAtomValue(debouncedQueryAtom);
    const data = _useQuery({ query, viewConfig: props.viewConfig });
    // eslint-disable-next-line
    // @ts-ignore
    return <props.Component {...data} />;
  };

  const Provider = (
    <ViewProvider viewConfig={props.viewConfig}>
      <Content />
    </ViewProvider>
  );

  return Provider;
};

export const generateConfigFrom = <
  TProvider extends Provider,
  TDataModel extends ConvexSchemaType
>(
  provider: TProvider,
  schema: TProvider extends 'convex' ? TDataModel : never
) => {
  let searchableFields: Record<string, SearchableField> | null = null;
  let viewFields: Record<string, ViewFieldConfig> | null = null;

  if (provider === 'convex') {
    searchableFields = generateSearchableFieldsFromConvexSchema(schema);
    viewFields = generateViewFieldsFromConvexSchema(schema);

    return new ConvexViewManager<TDataModel>(
      schema,
      viewFields,
      searchableFields,
      ViewDataProvider
    );
  } else {
    throw new Error('Provider not supported yet');
  }
};

export type InferViewProps<T> = T extends {
  createScreen: (props: any) => React.ReactNode;
}
  ? React.ComponentProps<React.ComponentProps<T['createScreen']>>
  : never;
