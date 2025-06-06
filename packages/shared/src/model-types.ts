import {
  coreQuery,
  DataType,
  GetTableName,
  MutationReturnDto,
  RecordType,
} from '@apps-next/core';
import {
  FunctionReference,
  GenericDatabaseWriter,
  GenericDataModel,
  GenericMutationCtx,
} from 'convex/server';
import { GenericId } from 'convex/values';
import { DataModel } from './_generated/dataModel';

export type IProjects = DataType<'projects'>;
export type ITags = DataType<'tags'>;
export type ITasks = DataType<'tasks'>;
export type ITodos = DataType<'todos'>;
export type IOwner = DataType<'owner'>;
export type IHistory = DataType<'history'>;
export type ICategories = DataType<'categories'>;
export type IViews = DataType<'views'>;
export type IUsers = DataType<'users'>;

export type MutationCtx = {
  user: IUsers;
  queryHandler: ReturnType<typeof coreQuery>;
} & GenericMutationCtx<DataModel>;

export type MakeServerFnRef<
  Args extends RecordType,
  ReturnType extends RecordType
> = FunctionReference<
  'mutation',
  'public',
  {
    name: string;
    viewName: string;
    apiKey: string;
  } & Args,
  MutationReturnDto<{ data?: ReturnType | undefined }>
>;

export type MakeServerFn<TArgs, TReturn> = (
  ctx: MutationCtx,
  args: TArgs
) => Promise<MutationReturnDto<{ data?: TReturn }>>;

export type Id<TableName extends GetTableName> = GenericId<TableName>;
