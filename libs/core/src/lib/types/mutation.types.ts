import { BaseViewConfigManagerInterface } from '../base-view-config';
import { FieldConfig, ID } from './base.types';
import { RegisteredViews, ViewConfigType } from './view-config.types';

type MutationRecord = Record<string, any>;

export type MutationRecordPayload = {
  record: MutationRecord;
  id: ID;
};

export type MutationWithoutRecordPayload = {
  id: ID;
};

export type MutationPayload =
  | MutationRecordPayload
  | MutationWithoutRecordPayload;

export type CREATE_RECORD = {
  type: 'CREATE_RECORD';
  payload: MutationRecordPayload;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type UPDATE_RECORD = {
  type: 'UPDATE_RECORD';
  payload: MutationRecordPayload;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type DELETE_RECORD = {
  type: 'DELETE_RECORD';
  payload: MutationWithoutRecordPayload;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type Mutation = CREATE_RECORD | UPDATE_RECORD | DELETE_RECORD;

export type MutationProps = {
  viewConfig: ViewConfigType;
  mutation: Mutation;
  query: string;
  registeredViews: RegisteredViews;
};

export type MutationPropsServer = {
  viewConfigManager: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
  mutation: Mutation;
};

export const SUCCESS_STATUS = {
  CREATED: 201 as const,
  UPDATED: 200 as const,
  DELETED: 200 as const,
} as const;

export const ERROR_STATUS = {
  INTERNAL_SERVER_ERROR: 500 as const,
  BAD_REQUEST: 400 as const,
  UNAUTHORIZED: 401 as const,
  FORBIDDEN: 403 as const,
  NOT_FOUND: 404 as const,
} as const;

export const STATUS = {
  ...SUCCESS_STATUS,
  ...ERROR_STATUS,
};

type SuccessStatusType = (typeof SUCCESS_STATUS)[keyof typeof SUCCESS_STATUS];
type ErrorStatusType = (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS];

export type MutationHandlerReturnType = {
  message: string;
  status: SuccessStatusType;
};

export type MutationHandlerSuccessType = {
  message: string;
  status: SuccessStatusType;
};

export type MutationContext = {
  table: string;
  view: string;
  displayField: string;
  type: Mutation['type'];
  payload: MutationPayload;
};

export type MutationHandlerErrorType = {
  message: string;
  error: string;
  status: ErrorStatusType;
  context: MutationContext;
};

export type MutationReturnDtoSuccess = {
  error?: never;
  success: MutationHandlerSuccessType;
};

export type MutationReturnDtoError = {
  success?: never;
  error: MutationHandlerErrorType;
};

export type MutationReturnDto =
  | MutationReturnDtoSuccess
  | MutationReturnDtoError;

export type ManyToManyMutationProps = {
  fieldName: string;
  table: string;
  values: ID[];
  manyToManyTable: string;
  manyToManyModelFields: FieldConfig[];
};
