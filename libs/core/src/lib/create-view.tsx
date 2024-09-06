import { createViewConfig } from './create-view-config';
import {
  GetTableDataType,
  ListAdapter,
  QueryReturnOrUndefined,
  RegisteredRouter,
  ViewConfigType,
} from './types';

export function createView<
  T extends keyof RegisteredRouter['config']['_datamodel']
>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>,
  Component: (props: {
    useList: ListAdapter<GetTableDataType<T>>;
    data: QueryReturnOrUndefined<GetTableDataType<T>>;
  }) => React.ReactNode
): () => React.ReactNode {
  const _config = createViewConfig(tableName, config);

  return () => (
    // <ViewDataProvider
    //   Component={Component}
    //   view={{
    //     viewConfigManager: new BaseViewConfigManager(_config),
    //   }}
    // />
    <></>
  );
}
