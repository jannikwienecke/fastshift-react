import { BaseViewConfigManagerInterface } from '../base-view-config';
import { ID } from './base.types';
import { ViewConfigType } from './view-config.types';

type MutationRecord = Record<string, any>;

type CREATE_RECORD = {
  type: 'CREATE_RECORD';
  record: MutationRecord;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

type UPDATE_RECORD = {
  type: 'UPDATE_RECORD';
  id: ID;
  record: MutationRecord;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

type DELETE_RECORD = {
  type: 'DELETE_RECORD';
  id: ID;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type Mutation = CREATE_RECORD | UPDATE_RECORD | DELETE_RECORD;

export type MutationProps = {
  viewConfig: ViewConfigType;
  mutation: Mutation;
};

export type MutationPropsServer = {
  viewConfigManager: BaseViewConfigManagerInterface;
  mutation: Mutation;
};

export type MutationHandlerReturnType = Promise<{
  success: boolean;
}>;

export type MutationReturnDto = {
  error?: any;
  succes: boolean;
};
