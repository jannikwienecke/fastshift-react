import {
  BaseViewConfigManagerInterface,
  ViewConfigType,
} from './view-config.types';

type MutationRecord = Record<string, any>;

type CREATE_RECORD = {
  type: 'CREATE_RECORD';
  record: MutationRecord;
};

type UPDATE_RECORD = {
  type: 'UPDATE_RECORD';
  id: string;
  record: MutationRecord;
};

type DELETE_RECORD = {
  type: 'DELETE_RECORD';
  id: string;
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
