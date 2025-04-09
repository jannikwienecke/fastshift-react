import { BaseViewConfigManagerInterface } from '../base-view-config';
import { FieldConfig, ID } from './base.types';
import { RegisteredViews } from './view-config.types';

type MutationRecord = Record<string, any>;

export type MutationRecordPayload = {
  record: MutationRecord;
  id: ID;
};

export type MutationSelectRecordsPayload = {
  id: ID;
  idsToDelete: ID[];
  newIds: ID[];
  table: string;
};

export type MutationWithoutRecordPayload = {
  id: ID;
};

export type MutationPayload =
  | MutationRecordPayload
  | MutationWithoutRecordPayload
  | MutationSelectRecordsPayload;

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

export type SELECT_RECORDS = {
  type: 'SELECT_RECORDS';
  payload: MutationSelectRecordsPayload;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type DELETE_RECORD = {
  type: 'DELETE_RECORD';
  payload: MutationWithoutRecordPayload;
  handler?: (items: MutationRecord[]) => MutationRecord[];
};

export type UserViewMutationType = 'UPDATE_VIEW' | 'CREATE_VIEW';

export type USER_VIEW_MUTATION = {
  type: 'USER_VIEW_MUTATION';
  payload: {
    type: UserViewMutationType;
    name: string;
    filters: string;
    displayOptions: string;
  };
};

export type Mutation =
  | CREATE_RECORD
  | UPDATE_RECORD
  | SELECT_RECORDS
  | DELETE_RECORD
  | USER_VIEW_MUTATION;

export type MutationDto = {
  viewName: string;
  mutation: Mutation;
  query: string;
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
  // status code for when the record has invalid data (like name is empty)
  INVALID_RECORD: 422 as const,
} as const;

export const STATUS = {
  ...SUCCESS_STATUS,
  ...ERROR_STATUS,
};

export type SuccessStatusType =
  (typeof SUCCESS_STATUS)[keyof typeof SUCCESS_STATUS];
export type ErrorStatusType = (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS];

export type MutationHandlerReturnType = {
  message: string;
  status: SuccessStatusType | ErrorStatusType;
  error?: string;
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
