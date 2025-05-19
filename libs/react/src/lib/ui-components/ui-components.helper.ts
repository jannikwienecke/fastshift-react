import { ComponentType } from '@apps-next/core';
import { store$, viewRegistry } from '../legend-store';

export const getComponent = ({
  fieldName,
  componentType,
  isDetail,
}: {
  fieldName: string;
  componentType: ComponentType;
  // TODO DETAIL BRANCHING
  isDetail?: boolean;
}) => {
  const uiViewConfig = {
    ...store$.uiViewConfig.get(),
    ...(store$.detail?.viewConfigManager.uiViewConfig.get() ?? {}),
  };

  const tableNameDetail = store$.detail.viewConfigManager.get()
    ? store$.detail?.viewConfigManager?.getTableName?.()
    : '';

  const tableNameConfig = store$.viewConfigManager.getTableName?.();

  const tableName = isDetail ? tableNameDetail ?? '' : tableNameConfig ?? '';

  const fallbackTableName = isDetail ? tableNameConfig : tableNameDetail;

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
