// interface Register {
//   //
// }

export interface BaseConfigInterface<
  TDataModel extends Record<string, any>,
  TableName
> {
  dataModel: TDataModel;
  tableNames: TableName[];
}
