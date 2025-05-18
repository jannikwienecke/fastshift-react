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

  const tableName = isDetail
    ? store$.detail.viewConfigManager.getTableName()
    : store$.viewConfigManager?.getTableName();

  const component =
    uiViewConfig?.[tableName]?.fields?.[fieldName]?.component?.[componentType];

  if (component) {
    return component;
  }

  return undefined;
};
