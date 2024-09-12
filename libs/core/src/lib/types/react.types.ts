import { GetTableDataType, GetTableName, RegisteredRouter } from './base.types';
import { ViewConfigType } from './view-config.types';

export type DataType<
  T extends GetTableName = any,
  TCustomDataType extends
    | Partial<Record<GetTableName, any>>
    | undefined = undefined
> = TCustomDataType extends undefined
  ? GetTableDataType<T> & { id: string }
  : TCustomDataType & GetTableDataType<T> & { id: string };
// : TCustomDataType & GetTableDataType<T> & { id: string };

// export type GetViewProps<
//   T extends keyof RegisteredRouter['config']['_datamodel']
// > = Parameters<Parameters<typeof createView<T>>[2]>[0];

export type DataTypeToUse<T extends DataType<any, any>> =
  T extends ViewConfigType ? GetTableDataType<T['tableName']> : T;
