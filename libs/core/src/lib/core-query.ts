import { BaseViewConfigManager } from './base-view-config';
import { getViewByName, patchAllViews, patchViewConfig } from './core-utils';
import { TranslationKeys, useTranslation } from './translations';
import {
  ERROR_STATUS,
  ErrorStatusType,
  MutationReturnDto,
  RegisteredViews,
  SUCCESS_STATUS,
  SuccessStatusType,
} from './types';

export const coreQuery = (props: {
  viewName: string;
  queryName: string;
  views: RegisteredViews;
  user: { id: string; email: string } | null;
  type: 'query' | 'mutation';
  args: Record<string, any>;
}) => {
  const registeredViews = patchAllViews(props.views);
  const viewConfig = getViewByName(registeredViews, props.viewName);

  if (!viewConfig) {
    throw new Error(`View configuration not found for view: ${props.viewName}`);
  }

  const viewConfigManager = new BaseViewConfigManager(
    patchViewConfig(viewConfig)
  );

  const makeError = (
    msg: TranslationKeys,
    args: { error: unknown; status?: ErrorStatusType }
  ) => {
    const errorMessage = (args.error as Error)?.message || String(args.error);

    return {
      error: {
        message: msg,
        error: errorMessage,
        status: args.status ?? ERROR_STATUS.INTERNAL_SERVER_ERROR,
        context: {
          view: props.viewName,
          displayField: viewConfigManager.getDisplayFieldLabel(),
          table: viewConfigManager.getTableName(),
          type: props.queryName,
          payload: {
            ...props.args,
            queryType: props.type,
          },
        },
      },
    } satisfies MutationReturnDto;
  };

  const makeSuccess = (
    message?: TranslationKeys,
    status?: SuccessStatusType
  ) => {
    return {
      success: {
        message: message ?? 'common.ok',
        status: status ?? SUCCESS_STATUS.UPDATED,
      },
    } satisfies MutationReturnDto;
  };

  const setArgs = (args: Record<string, any>) => {
    props.args = { ...props.args, ...args };
  };

  return {
    makeError,
    makeSuccess,
    viewConfigManager,
    setArgs,
    // other core query functions can be added here
  };
};
