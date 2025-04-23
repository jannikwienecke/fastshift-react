import { ComponentType } from '@apps-next/core';
import { store$ } from '../legend-store';

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
    : store$.viewConfigManager.getTableName();

  return uiViewConfig?.[tableName]?.fields?.[fieldName]?.component?.[
    componentType
  ];
};
