import { ComponentType } from '@apps-next/core';
import { store$, viewRegistry } from '../legend-store';

export const getComponent = ({
  fieldName,
  componentType,
  isDetail,
}: {
  fieldName: string;
  componentType: ComponentType;
  //  DETAIL BRANCHING
  isDetail?: boolean;
}) => {
  const tableNameDetail = store$.detail.viewConfigManager.get()
    ? store$.detail?.viewConfigManager?.getTableName?.()
    : '';

  const viewConfigManger = store$.viewConfigManager.get() ?? {};

  const tableNameConfig = viewConfigManger?.getTableName?.();
  const commanformTablename = store$.commandform.view.tableName.get();

  const tableName = isDetail
    ? tableNameDetail
    : commanformTablename || tableNameConfig || tableNameDetail;

  const uiConfigActiveTable = viewRegistry.getView(tableName) ?? {};

  const uiViewConfig = {
    ...uiConfigActiveTable.uiViewConfig,
    ...store$.uiViewConfig.get(),
    ...(store$.detail?.viewConfigManager.uiViewConfig.get() ?? {}),
  };

  const fallbackTableName = isDetail
    ? tableNameConfig
    : commanformTablename ?? tableNameDetail;

  let component =
    uiViewConfig?.[tableName]?.fields?.[fieldName]?.component?.[componentType];

  if (!component && componentType === 'icon') {
    component =
      uiViewConfig?.[fallbackTableName]?.fields?.[fieldName]?.component?.[
        componentType
      ];
  }

  return component;
};
