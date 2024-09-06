import { createView } from '../create-view';
import { GetTableDataType, GetTableName, RegisteredRouter } from './base.types';
import { ViewConfigType } from './view-config.types';

export type DataType<
  T extends GetTableName = any,
  TCustomDataType extends Record<string, any> | undefined = undefined
> = TCustomDataType extends undefined
  ? GetTableDataType<T>
  : TCustomDataType & GetTableDataType<T>;

export type GetViewProps<
  T extends keyof RegisteredRouter['config']['_datamodel']
> = Parameters<Parameters<typeof createView<T>>[2]>[0];

export type DataTypeToUse<T extends DataType<any, any>> =
  T extends ViewConfigType ? GetTableDataType<T['tableName']> : T;
